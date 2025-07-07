using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZooSanMarino.Domain.Entities
{
  public class Login
{
    public Guid     Id           { get; set; }
    public string   email     { get; set; } = null!;
    public string   PasswordHash { get; set; } = null!;
    public bool     IsEmailLogin { get; set; } = true; // para diferenciar tipos
    public bool     IsDeleted    { get; set; } = false;

    public ICollection<UserLogin> UserLogins { get; set; } = new List<UserLogin>();
}

}