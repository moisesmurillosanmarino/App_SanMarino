// src/app/features/config/user-management/user-management.component.ts
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import {
  faUserPlus, faUser, faUsers, faIdCard, faEnvelope, faPhone,
  faSave, faTimes, faTrash, faSearch
} from '@fortawesome/free-solid-svg-icons';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { UserService, UserListItem, CreateUserDto } from '../../../core/services/user/user.service';
import { Company, CompanyService } from '../../../core/services/company/company.service';
import { RoleService, Role } from '../../../core/services/role/role.service';

// === Validador: array requerido (>=1 ítem) ===
const requiredArray: ValidatorFn = (ctrl: AbstractControl) => {
  const v = ctrl.value;
  return Array.isArray(v) && v.length > 0 ? null : { required: true };
};

// === Validador: confirmar contraseña ===
const match = (field: string): ValidatorFn => (ctrl: AbstractControl) => {
  const parent = ctrl.parent as FormGroup | null;
  if (!parent) return null;
  const target = parent.get(field);
  return target && ctrl.value === target.value ? null : { mismatch: true };
};

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent, FontAwesomeModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  // Iconos
  faUserPlus = faUserPlus;  faUser = faUser;  faUsers = faUsers;  faIdCard = faIdCard;
  faEnvelope = faEnvelope;  faPhone = faPhone; faSave = faSave;   faTimes = faTimes;
  faTrash = faTrash;        faSearch = faSearch;

  // Datos
  users: UserListItem[] = [];
  companies: Company[] = [];
  companiesMap: Record<number, string> = {};
  roles: Role[] = [];
  rolesMap: Map<number, Role> = new Map();

  // Estado UI
  loading = false;
  filterTerm = '';
  modalOpen  = false;
  editing    = false;

  // Roles: filtro local / preview
  roleFilter = '';
  previewRoleId: number | null = null;

  // Forms
  userForm!: FormGroup;        // crear/editar usuario (datos + compañías + roles)
  credsForm!: FormGroup;       // cambiar email/contraseña (opcional, separado)
  credsModalOpen = false;      // modal de credenciales

  // Edición
  private editingUserId: string | null = null;

  // DI
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private companySvc  = inject(CompanyService);
  private roleSvc     = inject(RoleService);
  private cdr         = inject(ChangeDetectorRef);

  constructor(library: FaIconLibrary) {
    library.addIcons(
      faUserPlus, faUser, faUsers, faIdCard, faEnvelope, faPhone, faSave, faTimes, faTrash, faSearch
    );
  }

  ngOnInit(): void {
    // companyIds y roleIds como arrays + requiredArray
    this.userForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      password:   [''], // validación dinámica (alta vs edición)
      surName:    ['', Validators.required],
      firstName:  ['', Validators.required],
      cedula:     ['', [Validators.required, Validators.minLength(6)]],
      telefono:   ['', Validators.required],
      ubicacion:  ['', Validators.required],
      companyIds: this.fb.control<number[]>([], { validators: [requiredArray], nonNullable: true }),
      roleIds:    this.fb.control<number[]>([], { validators: [requiredArray], nonNullable: true }),
    });

    // formulario de credenciales (para modificar login/email/clave)
    this.credsForm = this.fb.group({
      userId:         [null, Validators.required],
      changeEmail:    [false],
      email:          [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      changePassword: [false],
      password:       [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
      confirm:        [{ value: '', disabled: true }, [Validators.required, match('password')]]
    });

    // Sincronizar confirm cuando cambia password
    this.credsForm.get('password')!.valueChanges.subscribe(() => {
      this.credsForm.get('confirm')!.updateValueAndValidity({ emitEvent: false });
    });

    // Revalidar roles cuando cambian compañías
    this.userForm.get('companyIds')!.valueChanges.subscribe(() => {
      this.purgeRolesNotValidForCompanies();
      this.userForm.get('roleIds')!.updateValueAndValidity({ emitEvent: false });
      this.cdr.detectChanges();
    });

    this.loadUsers();
    this.loadLookups();
  }

  // ============================
  // CARGAS
  // ============================
  private loadLookups() {
    this.loading = true;
    forkJoin({
      companies: this.companySvc.getAll(),
      roles:     this.roleSvc.getAll()
    })
    .pipe(finalize(() => this.loading = false))
    .subscribe(({ companies, roles }) => {
      this.companies = companies;
      this.companiesMap = companies.reduce((m, c) => {
        if (c.id !== undefined) {
          m[c.id] = c.name;
        }
        return m;
      }, {} as Record<number, string>);
      this.roles = roles;
      this.rolesMap = new Map(roles.map(r => [r.id, r]));
      this.purgeRolesNotValidForCompanies();
      this.cdr.detectChanges(); // nombres/contadores al toque
    });
  }

  private loadUsers(): void {
    this.loading = true;
    this.userService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.users = data,
        error: (err) => { console.error('Error cargando usuarios', err); this.users = []; }
      });
  }

  // ============================
  // GETTERS / CÁLCULOS
  // ============================
  get filteredUsers(): UserListItem[] {
    const term = this.filterTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u =>
      `${u.firstName} ${u.surName}`.toLowerCase().includes(term) ||
      (u.cedula ?? '').toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term) ||
      (u.primaryCompany ?? '').toLowerCase().includes(term) ||
      (u.primaryRole ?? '').toLowerCase().includes(term)
    );
  }

  private get selectedCompanyIds(): number[] {
    return (this.userForm.get('companyIds')?.value as number[]) ?? [];
  }

  private get selectedRoleIds(): number[] {
    return (this.userForm.get('roleIds')?.value as number[]) ?? [];
  }

  get availableRoles(): Role[] {
    const companies = this.selectedCompanyIds;
    if (!companies.length) return [];
    const set = new Set(companies);
    return this.roles
      .filter(r => r.companyIds?.some(cid => set.has(cid)))
      .filter(r => this.matchesRoleFilter(r));
  }
  get selectedRolesPermissions(): string[] {
    const uniq = new Set<string>();
    for (const id of this.selectedRoleIds) {
      const r = this.rolesMap.get(id);
      if (r?.permissions?.length) r.permissions.forEach(p => uniq.add((p || '').toLowerCase()));
    }
    return Array.from(uniq).sort();
  }
  get previewRolePermissions(): string[] {
    if (!this.previewRoleId) return [];
    const r = this.rolesMap.get(this.previewRoleId);
    return (r?.permissions ?? []).map(p => (p || '').toLowerCase()).sort();
  }
  private matchesRoleFilter(r: Role): boolean {
    const t = this.roleFilter.trim().toLowerCase();
    if (!t) return true;
    if (r.name?.toLowerCase().includes(t)) return true;
    return r.permissions?.some(p => (p || '').toLowerCase().includes(t)) ?? false;
  }

  // ============================
  // MODAL ALTA/EDICIÓN USUARIO
  // ============================
  openModal(user?: UserListItem) {
    this.editing = !!user;
    this.previewRoleId = null;
    this.applyPasswordValidators(this.editing);
    this.modalOpen = true;

    if (!this.editing || !user) {
      // Alta
      this.editingUserId = null;
      this.userForm.reset({
        email: '', password: '',
        surName: '', firstName: '',
        cedula: '', telefono: '', ubicacion: '',
        companyIds: [], roleIds: []
      }, { emitEvent: false });
      this.userForm.updateValueAndValidity({ emitEvent: true });
      this.cdr.detectChanges();
      return;
    }

    // Edición: traemos detalle para poblar companyIds/roleIds
    this.editingUserId = user.id;
    this.loading = true;

    this.userService.getById(user.id)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (detail) => {
          const roleIds = this.mapRoleNamesToIds(detail.roles);
          this.userForm.reset({
            email:     user.email,     // viene de la grilla
            password:  '',             // no requerido
            surName:   detail.surName,
            firstName: detail.firstName,
            cedula:    detail.cedula,
            telefono:  detail.telefono,
            ubicacion: detail.ubicacion,
            companyIds: detail.companyIds ?? [],
            roleIds:    roleIds
          }, { emitEvent: false });

          this.purgeRolesNotValidForCompanies();
          this.userForm.updateValueAndValidity({ emitEvent: true });
        },
        error: (err) => {
          console.error('Error cargando detalle', err);
          alert('No se pudo cargar el detalle del usuario.');
          this.modalOpen = false;
        }
      });
  }

  private mapRoleNamesToIds(roleNames: string[]): number[] {
    if (!roleNames?.length) return [];
    const mapByName = new Map<string, number>();
    for (const r of this.roles) {
      if (r?.name) mapByName.set(r.name.toLowerCase(), r.id);
    }
    const ids: number[] = [];
    for (const rn of roleNames) {
      const id = mapByName.get((rn || '').toLowerCase());
      if (id) ids.push(id);
    }
    return ids;
  }

  closeModal() { this.modalOpen = false; }

  private applyPasswordValidators(isEditing: boolean) {
    const pass = this.userForm?.get('password');
    if (!pass) return;
    if (isEditing) pass.clearValidators();
    else pass.setValidators([Validators.required, Validators.minLength(6)]);
    pass.updateValueAndValidity({ emitEvent: false });
  }

  // ============================
  // MODAL DE CREDENCIALES (email/clave)
  // ============================
  openCredentialsModal(user: UserListItem) {
    this.credsForm.reset({
      userId: user.id,
      changeEmail: false,
      email: { value: user.email ?? '', disabled: true },
      changePassword: false,
      password: { value: '', disabled: true },
      confirm: { value: '', disabled: true }
    });

    // asegurar validadores en estado correcto
    this.toggleChangeEmail(false);
    this.toggleChangePassword(false);
    this.credsModalOpen = true;
  }

  closeCredentialsModal() { this.credsModalOpen = false; }

  toggleChangeEmail(force?: boolean) {
    const chk = this.credsForm.get('changeEmail')!;
    if (typeof force === 'boolean') chk.setValue(force, { emitEvent: false });
    const enabled = chk.value === true;
    const email = this.credsForm.get('email')!;
    if (enabled) { email.enable(); email.setValidators([Validators.required, Validators.email]); }
    else { email.disable(); email.clearValidators(); }
    email.updateValueAndValidity({ emitEvent: false });
  }

  toggleChangePassword(force?: boolean) {
    const chk = this.credsForm.get('changePassword')!;
    if (typeof force === 'boolean') chk.setValue(force, { emitEvent: false });
    const enabled = chk.value === true;
    const pwd = this.credsForm.get('password')!;
    const cf  = this.credsForm.get('confirm')!;
    if (enabled) {
      pwd.enable(); cf.enable();
      pwd.setValidators([Validators.required, Validators.minLength(6)]);
      cf.setValidators([Validators.required, match('password')]);
    } else {
      pwd.disable(); cf.disable();
      pwd.clearValidators(); cf.clearValidators();
      pwd.setValue(''); cf.setValue('');
    }
    pwd.updateValueAndValidity({ emitEvent: false });
    cf.updateValueAndValidity({ emitEvent: false });
  }

  saveCredentials() {
    if (this.credsForm.invalid) {
      this.credsForm.markAllAsTouched();
      return;
    }
    const { userId, changeEmail, email, changePassword, password } = this.credsForm.getRawValue();

    if (!changeEmail && !changePassword) { this.closeCredentialsModal(); return; }

    // Hoy solo integramos cambio de contraseña (endpoint disponible).
    const tasks = [];
    if (changePassword) {
      tasks.push(this.userService.updatePassword(userId, password));
    }

    if (changeEmail) {
      // Sin endpoint de email en el backend actual: aviso.
      alert('Cambiar email requiere endpoint en backend. Solo se actualizará la contraseña.');
    }

    if (!tasks.length) return;

    this.loading = true;
    forkJoin(tasks)
      .pipe(
        catchError((err) => {
          console.error('Error actualizando credenciales', err);
          alert(err?.error?.message ?? 'No se pudieron actualizar las credenciales.');
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(() => {
        this.closeCredentialsModal();
        this.loadUsers();
      });
  }

  // ============================
  // INTERACCIÓN FORM PRINCIPAL
  // ============================
  toggleCompany(id: number) {
    const ctrl = this.userForm.get('companyIds')!;
    const arr: number[] = (ctrl.value as number[]) ?? [];
    const next = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
    ctrl.setValue(next);
    ctrl.markAsDirty(); ctrl.markAsTouched();
    ctrl.updateValueAndValidity({ emitEvent: true });

    this.purgeRolesNotValidForCompanies();
    this.userForm.get('roleIds')!.updateValueAndValidity({ emitEvent: true });
    this.cdr.detectChanges();
  }

  toggleRole(id: number) {
    if (!this.isRoleValidForSelectedCompanies(id)) return;
    const ctrl = this.userForm.get('roleIds')!;
    const arr: number[] = (ctrl.value as number[]) ?? [];
    const next = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
    ctrl.setValue(next);
    ctrl.markAsDirty(); ctrl.markAsTouched();
    ctrl.updateValueAndValidity({ emitEvent: true });
    this.cdr.detectChanges();
  }

  clearRoles() {
    const ctrl = this.userForm.get('roleIds')!;
    ctrl.setValue([]);
    ctrl.markAsDirty(); ctrl.updateValueAndValidity({ emitEvent: true });
    this.previewRoleId = null;
    this.cdr.detectChanges();
  }

  openRolePreview(roleId: number) { this.previewRoleId = roleId; }
  removeRole(roleId: number) {
    const ctrl = this.userForm.get('roleIds')!;
    ctrl.setValue((ctrl.value as number[]).filter(id => id !== roleId));
    ctrl.markAsDirty(); ctrl.updateValueAndValidity({ emitEvent: true });
    if (this.previewRoleId === roleId) this.previewRoleId = null;
    this.cdr.detectChanges();
  }

  // ============================
  // GUARDAR / ELIMINAR
  // ============================
  save() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const v = this.userForm.value;

    if (!this.editing) {
      // CREATE — todos obligatorios
      const dto: CreateUserDto = {
        email:     v.email!,
        password:  v.password!, // validado en alta
        surName:   v.surName!,
        firstName: v.firstName!,
        cedula:    v.cedula!,
        telefono:  v.telefono!,
        ubicacion: v.ubicacion!,
        companyIds: (v.companyIds as number[]) ?? [],
        roleIds:    (v.roleIds as number[]) ?? [],
      };

      this.loading = true;
      this.userService.create(dto)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => { this.loadUsers(); this.closeModal(); },
          error: (err) => {
            console.error('Error creando usuario', err);
            alert(err?.error?.message ?? 'No se pudo guardar el usuario');
          }
        });
      return;
    }

    // UPDATE (UDDI) — parcial
    const id = this.editingUserId!;
    const partial: any = {
      surName:   v.surName,
      firstName: v.firstName,
      cedula:    v.cedula,
      telefono:  v.telefono,
      ubicacion: v.ubicacion,
      companyIds: (v.companyIds as number[]) ?? undefined,
      roleIds:    (v.roleIds as number[]) ?? undefined,
    };
    // Elimina keys undefined para enviar solo lo cambiado
    Object.keys(partial).forEach(k => partial[k] === undefined && delete partial[k]);

    this.loading = true;
    this.userService.update(id, partial)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => { this.loadUsers(); this.closeModal(); },
        error: (err) => {
          console.error('Error actualizando usuario', err);
          alert(err?.error?.message ?? 'No se pudo actualizar el usuario');
        }
      });
  }

  delete(u: UserListItem) {
    if (!confirm(`¿Eliminar a ${u.firstName} ${u.surName}?`)) return;

    this.loading = true;
    this.userService.delete(u.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => { this.users = this.users.filter(x => x.id !== u.id); },
        error: (err) => {
          console.error('Error eliminando usuario', err);
          alert(err?.error?.message ?? 'No se pudo eliminar el usuario');
        }
      });
  }

  // ============================
  // HELPERS
  // ============================
  companyName(id: number | null): string { return id ? (this.companiesMap[id] ?? `#${id}`) : ''; }
  roleName(id: number | null): string { return id ? (this.rolesMap.get(id)?.name ?? `#${id}`) : ''; }

  private isRoleValidForSelectedCompanies(roleId: number): boolean {
    const r = this.rolesMap.get(roleId);
    if (!r) return false;
    const set = new Set(this.selectedCompanyIds);
    return r.companyIds?.some(cid => set.has(cid)) ?? false;
  }

  private purgeRolesNotValidForCompanies() {
    const ctrl = this.userForm.get('roleIds')!;
    const arr: number[] = (ctrl.value as number[]) ?? [];
    const cleaned = arr.filter(id => this.isRoleValidForSelectedCompanies(id));
    if (cleaned.length !== arr.length) {
      ctrl.setValue(cleaned);
      ctrl.updateValueAndValidity({ emitEvent: true });
    }
    if (this.previewRoleId && !this.isRoleValidForSelectedCompanies(this.previewRoleId)) {
      this.previewRoleId = null;
    }
  }
}
