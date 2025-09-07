# =========================
# Etapa 1: Base runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# La API escucha en 5002 (coherente con PORT del Program.cs/.env)
ENV ASPNETCORE_URLS=http://+:5002
ENV DOTNET_EnableDiagnostics=0
EXPOSE 5002

# =========================
# Etapa 2: Build + Publish
# =========================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiamos solution y proyectos
COPY ./ZooSanMarino.sln .
COPY ./src ./src
COPY ./tests ./tests

# Restore
RUN dotnet restore "ZooSanMarino.sln" --nologo

# Publish API
WORKDIR /src/src/ZooSanMarino.API
RUN dotnet publish -c Release -o /app/publish --no-restore /p:UseAppHost=false

# =========================
# Etapa final: Runtime
# =========================
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Opcional: entorno por defecto
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "ZooSanMarino.API.dll"]
