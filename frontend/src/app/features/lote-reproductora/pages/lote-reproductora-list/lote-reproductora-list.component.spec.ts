import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoteReproductoraListComponent } from './lote-reproductora-list.component';

describe('LoteReproductoraListComponent', () => {
  let component: LoteReproductoraListComponent;
  let fixture: ComponentFixture<LoteReproductoraListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteReproductoraListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoteReproductoraListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
