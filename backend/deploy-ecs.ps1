<# 
.SYNOPSIS
  Build, push a ECR y despliegue en ECS Fargate actualizando SOLO la imagen del contenedor indicado.

.PARAMETER Profile
  Perfil de AWS CLI (ej. sanmarino)

.PARAMETER Region
  Región AWS (ej. us-east-2)

.PARAMETER Cluster
  Nombre del cluster ECS

.PARAMETER Service
  Nombre del servicio ECS

.PARAMETER Family
  Family (Task Definition) base (ej. sanmarino-backend)

.PARAMETER RepoName
  Nombre del repositorio ECR (ej. sanmarino-backend)

.PARAMETER Container
  Nombre del contenedor dentro de la TD a actualizar (default: api)

.PARAMETER Tag
  Tag para la imagen. Si se omite, se usa timestamp yyyyMMdd-HHmm

.PARAMETER UseBuildx
  Si se especifica, usa `docker buildx build --platform linux/amd64 --load`
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Profile,
  [Parameter(Mandatory=$true)][string]$Region,
  [Parameter(Mandatory=$true)][string]$Cluster,
  [Parameter(Mandatory=$true)][string]$Service,
  [Parameter(Mandatory=$true)][string]$Family,
  [Parameter(Mandatory=$true)][string]$RepoName,
  [string]$Container = 'api',
  [string]$Tag,
  [switch]$UseBuildx
)

$ErrorActionPreference = 'Stop'

function Step($msg) { Write-Host "=== $msg ===" -ForegroundColor Cyan }
function Info($msg) { Write-Host "» $msg" -ForegroundColor DarkGray }
function Done($msg) { Write-Host $msg -ForegroundColor Green }

# 0) Ambiente AWS
$env:AWS_PROFILE = $Profile
$env:AWS_REGION  = $Region

Step "Cuenta / Registry"
$Account  = aws sts get-caller-identity --query Account --output text
$Registry = "$Account.dkr.ecr.$Region.amazonaws.com"
$RepoUri  = "$Registry/$RepoName"
if (-not $Tag -or $Tag.Trim() -eq '') { $Tag = (Get-Date).ToString('yyyyMMdd-HHmm') }

Write-Host ("Account:  {0}" -f $Account)
Write-Host ("Registry: {0}" -f $Registry)
Write-Host ("Repo:     {0}" -f $RepoUri)
Write-Host ("Tag:      {0}" -f $Tag)

# 1) Login ECR + asegurar repo
Step "Login ECR"
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry | Out-Null

Step "Asegurar repositorio"
try {
  aws ecr describe-repositories --repository-names $RepoName | Out-Null
} catch {
  aws ecr create-repository --repository-name $RepoName | Out-Null
}
Write-Host ("Repo URI: {0}" -f $RepoUri)

# 2) Build / Tag / Push
Step "Build / Tag / Push"
$localTag = "$($RepoName):$Tag"
$fullTag  = "$($RepoUri):$Tag"

if ($UseBuildx) {
  Info "docker buildx build --platform linux/amd64 -t $localTag . --load"
  docker buildx build --platform linux/amd64 -t $localTag . --load
} else {
  Info "docker build -t $localTag ."
  docker build -t $localTag .
}

Info "docker tag $localTag $fullTag"
docker tag $localTag $fullTag

Info "docker push $fullTag"
docker push $fullTag | Out-Null

# 3) Exportar containerDefinitions y modificar SOLO el contenedor objetivo
Step "Leer Task Definition actual"
# Exporta lo que devuelve AWS CLI (JSON 100% válido)
aws ecs describe-task-definition --task-definition $Family `
  --query 'taskDefinition.containerDefinitions' --output json > containers.json

# Asegurar que containers.json sea SIEMPRE un ARREGLO JSON
$raw = Get-Content .\containers.json -Raw
if ($raw.TrimStart().StartsWith('{')) {
  $raw = "[$raw]"
  Set-Content -Path .\containers.json -Value $raw -Encoding ascii -NoNewline
}

# Cargar, actualizar imagen del contenedor destino, forzar env.value a string
$containers = Get-Content .\containers.json -Raw | ConvertFrom-Json
$containers = @($containers)  # fuerza arreglo

foreach ($c in $containers) {
  if ($c.name -eq $Container) { 
    $c.image = "$($RepoUri):$Tag"   # OJO: $() evita el error del ':'
  }
  if ($c.environment) {
    foreach ($e in $c.environment) { 
      if ($null -ne $e.value) { $e.value = "$($e.value)" }  # fuerza string
    }
  }
}

# Guardar JSON compacto y sin BOM
$containersJson = ConvertTo-Json -InputObject $containers -Depth 100 -Compress
Set-Content -Path .\containers.json -Value $containersJson -Encoding ascii -NoNewline
$firstChar = (Get-Content .\containers.json -Raw).Substring(0,1)
if ($firstChar -ne '[') { throw "containers.json no es un arreglo JSON. Primer carácter: $firstChar" }

# 4) Tomar metadatos mínimos de la TD base
$meta = aws ecs describe-task-definition --task-definition $Family `
  --query 'taskDefinition.{cpu:cpu,memory:memory,networkMode:networkMode,taskRoleArn:taskRoleArn,executionRoleArn:executionRoleArn,volumes:volumes}' `
  --output json | ConvertFrom-Json

# (Opcional) Volúmenes
$volArg = @()
if ($meta.volumes -and $meta.volumes.Count -gt 0) {
  $volJson = ConvertTo-Json -InputObject @($meta.volumes) -Depth 100 -Compress
  Set-Content -Path .\volumes.json -Value $volJson -Encoding ascii -NoNewline
  $volArg = @("--volumes","file://$(Join-Path (Get-Location) 'volumes.json')")
}

# 5) Registrar nueva revisión de la TD (usando flags + file://containers.json)
Step "Registrar nueva revisión de TD"
$awsArgs = @(
  "ecs","register-task-definition",
  "--family",$Family,
  "--network-mode",$meta.networkMode,
  "--requires-compatibilities","FARGATE",
  "--cpu","$($meta.cpu)",
  "--memory","$($meta.memory)",
  "--container-definitions","file://$(Join-Path (Get-Location) 'containers.json')",
  "--query","taskDefinition.taskDefinitionArn",
  "--output","text"
)

if ($meta.executionRoleArn) { $awsArgs += @("--execution-role-arn",$meta.executionRoleArn) }
if ($meta.taskRoleArn)      { $awsArgs += @("--task-role-arn",$meta.taskRoleArn) }
$awsArgs += $volArg

$NEW_TD_ARN = aws @awsArgs
if (-not $NEW_TD_ARN -or $NEW_TD_ARN.Trim() -eq '') { throw "No se obtuvo NEW_TD_ARN. Revisa el paso de registro." }
Done ("Nueva TD: {0}" -f $NEW_TD_ARN)

# 6) Actualizar servicio y esperar estable
Step "Forzar despliegue"
aws ecs update-service --cluster $Cluster --service $Service --task-definition $NEW_TD_ARN --force-new-deployment | Out-Null

Step "Esperar a estado estable"
aws ecs wait services-stable --cluster $Cluster --services $Service

# 7) Verificación final
Step "Verificar imagen activa"
$activeTd  = aws ecs describe-services --cluster $Cluster --services $Service --query 'services[0].taskDefinition' --output text
$activeImg = aws ecs describe-task-definition --task-definition $activeTd `
  --query ("taskDefinition.containerDefinitions[?name=='{0}'].image" -f $Container) --output text

Write-Host ("Servicio TD activa: {0}" -f $activeTd) -ForegroundColor Yellow
Write-Host ("Contenedor '{0}' imagen: {1}" -f $Container, $activeImg) -ForegroundColor Yellow

# 8) Últimos eventos útiles
Step "Eventos recientes"
aws ecs describe-services --cluster $Cluster --services $Service `
  --query 'services[0].events[0:8].[createdAt,message]' --output table | Out-String | Write-Host

Done "Despliegue completado."
