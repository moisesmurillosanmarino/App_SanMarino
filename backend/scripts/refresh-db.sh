set -euo pipefail

if [ -z "${1-}" ]; then
  echo "Uso: $0 <MigrationName>"
  exit 1
fi

MIGRATION_NAME=$1
INFRA="src/ZooSanMarino.Infrastructure"
API="src/ZooSanMarino.API"

echo "🔨 Build…"
dotnet build

echo "🆕 Añadiendo migración ${MIGRATION_NAME}…"
dotnet ef migrations add "${MIGRATION_NAME}" \
    --project "${INFRA}" \
    --startup-project "${API}"

echo "🛢  Aplicando migraciones…"
dotnet ef database update \
    --project "${INFRA}" \
    --startup-project "${API}"

echo "✅ Listo."
