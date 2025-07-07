// src/ZooSanMarino.Application/DTOs/CompanyDto.cs
namespace ZooSanMarino.Application.DTOs;
public record CompanyDto(
    int      Id,
    string   Name,
    string   Identifier,
    string   DocumentType,
    string?  Address,
    string?  Phone,
    string?  Email,
    string?  Country,
    string?  State,
    string?  City,
    string[] VisualPermissions,
    bool     MobileAccess
);