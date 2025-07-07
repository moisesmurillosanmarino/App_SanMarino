using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZooSanMarino.Domain.Entities
{
   public class UserLogin
{
    public Guid UserId  { get; set; }
    public Guid LoginId { get; set; }

    public bool     IsLockedByAdmin { get; set; } = false;
    public string?  LockReason      { get; set; }

    public User  User  { get; set; } = null!;
    public Login Login { get; set; } = null!;
}

}