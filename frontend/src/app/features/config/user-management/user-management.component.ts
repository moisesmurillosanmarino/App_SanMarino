// src/app/features/config/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { SidebarComponent }  from '../../../shared/components/sidebar/sidebar.component';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faUserPlus,
  faUser,
  faUsers,
  faIdCard,
  faEnvelope,
  faPhone,
  faSave,
  faTimes,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SidebarComponent,
    FontAwesomeModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  // iconos para plantilla
  public faUserPlus = faUserPlus;
  public faUser     = faUser;
  public faUsers    = faUsers;
  public faIdCard   = faIdCard;
  public faEnvelope = faEnvelope;
  public faPhone    = faPhone;
  public faSave     = faSave;
  public faTimes    = faTimes;
  public faTrash    = faTrash;

  users: User[] = [
    { id: 1, nombre: 'Ana',    apellido: 'Gómez',   cedula: '12345678', correo: 'ana@gomez.com',   telefono: '3001234567' },
    { id: 2, nombre: 'Carlos', apellido: 'Pérez',   cedula: '87654321', correo: 'carlos@perez.com', telefono: '3107654321' },
    { id: 3, nombre: 'Luisa',  apellido: 'Ramírez', cedula: '11223344', correo: 'luisa@ramirez.com', telefono: '3120011223' },
  ];

  filterTerm = '';
  modalOpen   = false;
  editing     = false;
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faUserPlus, faUser, faUsers, faIdCard,
      faEnvelope, faPhone, faSave, faTimes, faTrash
    );
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nombre:   ['', Validators.required],
      apellido: ['', Validators.required],
      cedula:   ['', [Validators.required, Validators.minLength(6)]],
      correo:   ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
    });
  }

  get filteredUsers(): User[] {
    const term = this.filterTerm.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(u =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(term) ||
      u.cedula.includes(term) ||
      u.correo.toLowerCase().includes(term)
    );
  }

  openModal(user?: User) {
    this.editing = !!user;
    if (this.editing && user) {
      this.userForm.patchValue(user);
      this.userForm.addControl('id', this.fb.control(user.id));
    } else {
      this.userForm.reset();
      this.userForm.removeControl('id');
    }
    this.modalOpen = true;
  }

  save() {
    if (this.userForm.invalid) return;
    const data = this.userForm.value as User;
    if (this.editing) {
      const idx = this.users.findIndex(u => u.id === data.id);
      this.users[idx] = data;
    } else {
      data.id = Math.max(0, ...this.users.map(u => u.id)) + 1;
      this.users.push(data);
    }
    this.closeModal();
  }

  delete(user: User) {
    this.users = this.users.filter(u => u.id !== user.id);
  }

  closeModal() {
    this.modalOpen = false;
  }
}
