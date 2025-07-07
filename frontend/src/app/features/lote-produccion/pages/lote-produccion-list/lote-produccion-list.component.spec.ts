import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteProduccionListComponent } from './lote-produccion-list.component';

describe('LoteProduccionListComponent', () => {
  let component: LoteProduccionListComponent;
  let fixture: ComponentFixture<LoteProduccionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteProduccionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoteProduccionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
