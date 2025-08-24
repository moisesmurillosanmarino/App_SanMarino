// src/app/features/config/role-management/role-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  FontAwesomeModule,
  FaIconLibrary
} from '@fortawesome/angular-fontawesome';
import {
  faUserShield,
  faPen,
  faTrash,
  faPlus,
  faKey,
  faUsers,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import {
  RoleService,
  Role,
  CreateRoleDto,
  UpdateRoleDto
} from '../../../core/services/role/role.service';
import { CompanyService, Company } from '../../../core/services/company/company.service';
import {
  PermissionService,
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto
} from '../../../core/services/permission/permission.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  // icons usados en el HTML
  faUserShield = faUserShield;
  faPen = faPen;
  faTrash = faTrash;
  faPlus = faPlus;
  faKey = faKey;
  faUsers = faUsers;
  faMagnifyingGlass = faMagnifyingGlass;

  // pestañas y filtros (para el HTML)
  activeTab: 'roles' | 'perms' = 'roles';
  filterRoles = '';
  filterPerms = '';

  // data
  roles: Role[] = [];
  companies: Company[] = [];
  companiesMap: Record<number, string> = {};
  permissions: Permission[] = [];

  // ui state
  loading = false;
  modalOpen = false;      // modal de rol
  editing = false;

  permModalOpen = false;  // modal de permisos
  permEditing = false;

  // forms
  form!: FormGroup;        // rol
  permForm!: FormGroup;    // permiso

  constructor(
    private fb: FormBuilder,
    private roleSvc: RoleService,
    private companySvc: CompanyService,
    private permSvc: PermissionService,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faUserShield, faPen, faTrash, faPlus, faKey, faUsers, faMagnifyingGlass
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id:           [null],
      name:         ['', Validators.required],
      permissions:  [[], Validators.required],
      companyIds:   [[], Validators.required],
    });

    this.permForm = this.fb.group({
      id:          [null],
      key:         ['', [Validators.required, Validators.pattern(/^[a-z0-9_.:-]+$/i)]],
      description: ['']
    });

    this.loadCompanies();
    this.loadPermissions();
    this.loadRoles();
  }

  // =========================
  // LOADERS
  // =========================
  private loadCompanies() {
    this.companySvc.getAll().subscribe(list => {
      this.companies = list;
      this.companiesMap = list.reduce((m, c) => {
        if (c.id !== undefined) {
          m[c.id] = c.name;
        }
        return m;
      }, {} as Record<number, string>);
    });
  }

  private loadPermissions() {
    this.permSvc.getAll().subscribe(list => {
      // normalizar a minúsculas para coherencia visual
      this.permissions = list.map(p => ({ ...p, key: (p.key || '').toLowerCase() }));
      this.syncRoleFormPermissions(); // por si había seleccionados que ya no existen
    });
  }

  private loadRoles() {
    this.loading = true;
    this.roleSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.roles = list);
  }

  private syncRoleFormPermissions() {
    if (!this.form) return;
    const selected: string[] = this.form.controls['permissions'].value || [];
    if (!selected.length) return;
    const valid = new Set(this.permissions.map(p => p.key));
    const filtered = selected.filter(k => valid.has((k || '').toLowerCase()));
    if (filtered.length !== selected.length) {
      this.form.patchValue({ permissions: filtered }, { emitEvent: false });
    }
  }

  // =========================
  // GETTERS PARA FILTRO (HTML usa filteredRoles / filteredPerms)
  // =========================
  get filteredRoles(): Role[] {
    const t = this.filterRoles.trim().toLowerCase();
    if (!t) return this.roles;
    return this.roles.filter(r => {
      const inName = (r.name || '').toLowerCase().includes(t);
      const inPerms = (r.permissions || []).some(p => (p || '').toLowerCase().includes(t));
      const inCompanies = (r.companyIds || []).some(id => (this.companiesMap[id] || '').toLowerCase().includes(t));
      return inName || inPerms || inCompanies;
    });
  }

  get filteredPerms(): Permission[] {
    const t = this.filterPerms.trim().toLowerCase();
    if (!t) return this.permissions;
    return this.permissions.filter(p =>
      (p.key || '').toLowerCase().includes(t) ||
      (p.description || '').toLowerCase().includes(t)
    );
  }

  // =========================
  // ROLE MODAL
  // =========================
  openModal(r?: Role) {
    this.editing = !!r;
    if (r) {
      this.form.setValue({
        id:           r.id,
        name:         r.name,
        permissions:  [...(r.permissions || []).map(k => (k || '').toLowerCase())],
        companyIds:   [...(r.companyIds || [])]
      });
    } else {
      this.form.reset({ id: null, name: '', permissions: [], companyIds: [] });
    }
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  togglePermission(permKey: string) {
    const key = (permKey || '').toLowerCase();
    const control = this.form.controls['permissions'];
    const perms = control.value as string[];
    control.setValue(
      perms.includes(key) ? perms.filter(p => p !== key) : [...perms, key]
    );
  }

  toggleCompany(cid: number) {
    const control = this.form.controls['companyIds'];
    const comps = control.value as number[];
    control.setValue(
      comps.includes(cid) ? comps.filter(id => id !== cid) : [...comps, cid]
    );
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const dto = this.editing
      ? { id: v.id, name: v.name.trim(), permissions: (v.permissions as string[]).map(k => k.toLowerCase()), companyIds: v.companyIds } as UpdateRoleDto
      : { name: v.name.trim(), permissions: (v.permissions as string[]).map(k => k.toLowerCase()), companyIds: v.companyIds } as CreateRoleDto;

    this.loading = true;
    const op$ = this.editing ? this.roleSvc.update(dto as UpdateRoleDto)
                             : this.roleSvc.create(dto as CreateRoleDto);

    op$
      .pipe(finalize(() => { this.loading = false; this.modalOpen = false; }))
      .subscribe({
        next: () => this.loadRoles(),
        error: (e) => alert(e?.error?.message || 'No se pudo guardar el rol')
      });
  }

  deleteRole(id: number) {
    if (!confirm('¿Eliminar este rol?')) return;
    this.loading = true;
    this.roleSvc.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => this.loadRoles(),
        error: (e) => alert(e?.error?.message || 'No se pudo eliminar el rol')
      });
  }

  // =========================
  // PERMISSIONS MODAL
  // =========================
  abrirModalPermisos() {
    this.permEditing = false;
    this.permForm.reset({ id: null, key: '', description: '' });
    this.permModalOpen = true;
  }

  cerrarModalPermisos() {
    this.permModalOpen = false;
  }

  editarPermiso(p: Permission) {
    this.permEditing = true;
    this.permForm.setValue({
      id: p.id,
      key: (p.key || '').toLowerCase(),
      description: p.description || ''
    });
    this.permModalOpen = true;
  }

  guardarPermiso() {
    if (this.permForm.invalid) return;
    const v = this.permForm.value;
    const key = (v.key as string).trim().toLowerCase();
    const description = (v.description || '').trim();

    const op$ = this.permEditing
      ? this.permSvc.update({ id: v.id, key, description } as UpdatePermissionDto)
      : this.permSvc.create({ key, description } as CreatePermissionDto);

    op$.subscribe({
      next: () => {
        this.loadPermissions();
        // mantener abierto para crear varios seguidos
        this.permEditing = false;
        this.permForm.reset({ id: null, key: '', description: '' });
      },
      error: (e) => alert(e?.error?.message || 'No se pudo guardar el permiso')
    });
  }

  eliminarPermiso(p: Permission) {
    if (!confirm(`¿Eliminar permiso "${p.key}"?`)) return;
    this.permSvc.delete(p.id).subscribe({
      next: () => {
        this.loadPermissions();
        if (this.permForm.value.id === p.id) {
          this.permEditing = false;
          this.permForm.reset({ id: null, key: '', description: '' });
        }
      },
      error: (e) => alert(e?.error?.message || 'No se pudo eliminar el permiso (¿asignado a roles?)')
    });
  }

  // helpers
  companyName(id: number) {
    return this.companiesMap[id] ?? `#${id}`;
  }

  trackByRoleId = (_: number, r: Role) => r.id;
  trackByPermId = (_: number, p: Permission) => p.id;
}
