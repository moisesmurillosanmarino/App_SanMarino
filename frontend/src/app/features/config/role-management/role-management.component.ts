// src/app/features/config/role-management/role-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
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
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  RoleService,
  Role,
  CreateRoleDto,
  UpdateRoleDto
} from '../../../core/services/role/role.service';
import { CompanyService, Company } from '../../../core/services/company/company.service';
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
  faUserShield = faUserShield;
  faPen        = faPen;
  faTrash      = faTrash;
  faPlus       = faPlus;

  roles: Role[] = [];
  companies: Company[] = [];
  companiesMap: Record<number,string> = {};
  allPermissions = [
    'view_reports',
    'download_reports',
    'manage_users',
    'manage_companies',
    'manage_roles',
  ];

  form!: FormGroup;
  modalOpen = false;
  loading = false;
  editing = false;

  constructor(
    private fb: FormBuilder,
    private roleSvc: RoleService,
    private companySvc: CompanyService,
    library: FaIconLibrary
  ) {
    library.addIcons(faUserShield, faPen, faTrash, faPlus);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id:           [null],
      name:         ['', Validators.required],
      permissions:  [[], Validators.required],
      companyIds:   [[], Validators.required],
    });

    this.loadCompanies();
    this.loadRoles();
  }

  private loadCompanies() {
    this.companySvc.getAll().subscribe(list => {
      this.companies = list;
      this.companiesMap = list.reduce((m, c) => {
        m[c.id] = c.name;
        return m;
      }, {} as Record<number,string>);
    });
  }

  private loadRoles() {
    this.loading = true;
    this.roleSvc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(list => this.roles = list);
  }

  openModal(r?: Role) {
    this.editing = !!r;
    if (r) {
      this.form.setValue({
        id:           r.id,
        name:         r.name,
        permissions:  [...r.permissions],
        companyIds:   [...r.companyIds]
      });
    } else {
      this.form.reset({ id: null, name: '', permissions: [], companyIds: [] });
    }
    this.modalOpen = true;
  }

  togglePermission(perm: string) {
    const perms = this.form.controls['permissions'].value as string[];
    this.form.controls['permissions'].setValue(
      perms.includes(perm)
        ? perms.filter(p => p !== perm)
        : [...perms, perm]
    );
  }

  toggleCompany(cid: number) {
    const comps = this.form.controls['companyIds'].value as number[];
    this.form.controls['companyIds'].setValue(
      comps.includes(cid)
        ? comps.filter(id => id !== cid)
        : [...comps, cid]
    );
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const dto = this.editing
      ? { id: v.id, name: v.name, permissions: v.permissions, companyIds: v.companyIds } as UpdateRoleDto
      : { name: v.name, permissions: v.permissions, companyIds: v.companyIds } as CreateRoleDto;

    this.loading = true;
    const op$ = this.editing
      ? this.roleSvc.update(dto as UpdateRoleDto)
      : this.roleSvc.create(dto as CreateRoleDto);

    op$
      .pipe(finalize(() => {
        this.loading = false;
        this.modalOpen = false;
      }))
      .subscribe(() => this.loadRoles());
  }

  deleteRole(id: number) {
    if (!confirm('¿Eliminar este rol?')) return;
    this.loading = true;
    this.roleSvc.delete(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.loadRoles());
  }

  closeModal() {
    this.modalOpen = false;
  }
}
