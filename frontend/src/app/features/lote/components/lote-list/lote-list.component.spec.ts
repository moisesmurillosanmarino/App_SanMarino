import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteListComponent } from './lote-list.component';

describe('LoteListComponent', () => {
  let component: LoteListComponent;
  let fixture: ComponentFixture<LoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
