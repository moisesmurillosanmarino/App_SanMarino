import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NucleoListComponent } from './nucleo-list.component';

describe('NucleoListComponent', () => {
  let component: NucleoListComponent;
  let fixture: ComponentFixture<NucleoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NucleoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NucleoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
