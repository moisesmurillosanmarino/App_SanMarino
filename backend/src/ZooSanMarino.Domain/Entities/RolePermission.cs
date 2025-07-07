using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZooSanMarino.Domain.Entities
{
    public class RolePermission
    {
        public int RoleId      { get; set; }
        public int PermissionId{ get; set; }

        public Role       Role       { get; set; } = null!;
        public Permission Permission { get; set; } = null!;
    }

}