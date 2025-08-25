# Etapa 1: Runtime base
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80

# Etapa 2: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ./ZooSanMarino.sln .
COPY ./src ./src
COPY ./tests ./tests

RUN dotnet restore "ZooSanMarino.sln"

WORKDIR /src/src/ZooSanMarino.API
RUN dotnet publish -c Release -o /app/publish --no-restore

# Etapa final: runtime
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "ZooSanMarino.API.dll"]
