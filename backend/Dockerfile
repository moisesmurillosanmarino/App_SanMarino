FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar solo el .csproj para restaurar dependencias primero
COPY ./src/ZooSanMarino.API/ZooSanMarino.API.csproj ./ZooSanMarino.API/
RUN dotnet restore ./ZooSanMarino.API/ZooSanMarino.API.csproj

# Copiar el resto del código
COPY ./src/ZooSanMarino.API ./ZooSanMarino.API

WORKDIR /src/ZooSanMarino.API
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ZooSanMarino.API.dll"]
