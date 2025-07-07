import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoLoteLevanteListComponent } from './seguimiento-lote-levante-list.component';

describe('SeguimientoLoteLevanteListComponent', () => {
  let component: SeguimientoLoteLevanteListComponent;
  let fixture: ComponentFixture<SeguimientoLoteLevanteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoLoteLevanteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeguimientoLoteLevanteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
