import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  faList,
  faEye,
  faPen,
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  MasterListService,
  MasterListDto,
  UpdateMasterListDto
} from '../../../core/services/master-list/master-list.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-master-lists',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    RouterModule,
    FontAwesomeModule
  ],
  templateUrl: './master-lists.component.html',
  styleUrls: ['./master-lists.component.scss']
})
export class MasterListsComponent implements OnInit {
  faList  = faList;
  faEye   = faEye;
  faPen   = faPen;
  faTrash = faTrash;
  faPlus  = faPlus;

  lists: MasterListDto[] = [];
  loading = false;

  // En lugar de list.expanded, mantenemos un Set de IDs expandidos:
  expandedIds = new Set<number>();

  editModalOpen = false;
  editingList: MasterListDto | null = null;
  editForm!: FormGroup;

  constructor(
    private svc: MasterListService,
    private fb: FormBuilder,
    private router: Router,
    library: FaIconLibrary
  ) {
    library.addIcons(faList, faEye, faPen, faTrash, faPlus);
  }

  ngOnInit() {
    this.loadLists();
  }

  private loadLists() {
    this.loading = true;
    this.svc.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => this.lists = data);
  }

  newList() {
    this.router.navigate(['/config/master-lists', 'new']);
  }

  // Toggle usando el Set
  toggleOptions(list: MasterListDto) {
    if (this.expandedIds.has(list.id)) {
      this.expandedIds.delete(list.id);
    } else {
      this.expandedIds.add(list.id);
    }
  }

  delete(list: MasterListDto) {
    if (!confirm(`¿Eliminar la lista “${list.name}”?`)) return;
    this.loading = true;
    this.svc.delete(list.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.loadLists());
  }
  edit(list: MasterListDto) {
    // En lugar de abrir un modal que no existe,
    // navegamos al detail component:
    this.router.navigate(['/config/master-lists', list.id]);
  }

  get optionsFA(): FormArray {
    return this.editForm.get('options') as FormArray;
  }

  addOption() {
    this.optionsFA.push(this.fb.control('', Validators.required));
  }

  removeOption(i: number) {
    this.optionsFA.removeAt(i);
  }

  saveEdit() {
    if (this.editForm.invalid || !this.editingList) {
      this.editForm.markAllAsTouched();
      return;
    }

    const dto: UpdateMasterListDto = {
      id: this.editingList.id,
      key: this.editingList.key,
      name: this.editForm.value.name,
      options: this.editForm.value.options
    };

    this.loading = true;
    this.svc.update(dto)
      .pipe(finalize(() => {
        this.loading = false;
        this.closeEdit();
      }))
      .subscribe(() => this.loadLists());
  }

  closeEdit() {
    this.editModalOpen = false;
    this.editingList = null;
  }
}
