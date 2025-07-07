import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalponFormComponent } from './galpon-form.component';

describe('GalponFormComponent', () => {
  let component: GalponFormComponent;
  let fixture: ComponentFixture<GalponFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalponFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GalponFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
