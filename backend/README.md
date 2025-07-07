backend/
├── ZooSanMarino.sln
├── global.json              ← (opcional) fija SDK .NET 8
├── docker-compose.yml
├── src/
│   ├── ZooSanMarino.Domain/         ← Lógica de negocio pura (Entidades, VO, interfaces)
│   │   ├── Entities/
│   │   └── Interfaces/
│   ├── ZooSanMarino.Application/    ← Casos de uso, DTOs, puertos secundarios
│   │   ├── DTOs/
│   │   └── UseCases/
│   ├── ZooSanMarino.Infrastructure/ ← Adaptadores (EF Core, Postgres, repositorios)
│   │   ├── Persistence/
│   │   └── Repositories/
│   └── ZooSanMarino.API/            ← Web API (Program.cs, Controllers o Minimal API)
│       ├── Controllers/
│       └── DTOs/
└── tests/
    ├── ZooSanMarino.Domain.Tests/
    └── ZooSanMarino.Application.Tests/


## Actualizar la base de datos 

dotnet ef migrations add AddSeguimientoLoteLevante  -- nombre que tendra la migracion 
dotnet ef database update   --- actualizara la base de datos

## migrar desde la carpeta de infrastructure
dotnet ef migrations add AddSeguimientoLoteLevante --project ZooSanMarino.Infrastructure --startup-project ZooSanMarino.API

## Aplicar migracion 
dotnet ef database update --project ZooSanMarino.Infrastructure --startup-project ZooSanMarino.API

