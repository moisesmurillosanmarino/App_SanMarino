import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteFormComponent } from './lote-form.component';

describe('LoteFormComponent', () => {
  let component: LoteFormComponent;
  let fixture: ComponentFixture<LoteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
