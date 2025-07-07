using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZooSanMarino.Domain.Entities
{
    public class UserCompany
{
    public Guid UserId   { get; set; }
    public int  CompanyId{ get; set; }

    public bool IsDefault { get; set; } = false; // Empresa principal

    public User    User    { get; set; } = null!;
    public Company Company { get; set; } = null!;
}

}