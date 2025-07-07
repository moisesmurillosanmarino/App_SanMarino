import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NucleoFormComponent } from './nucleo-form.component';

describe('NucleoFormComponent', () => {
  let component: NucleoFormComponent;
  let fixture: ComponentFixture<NucleoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NucleoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NucleoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
