import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalponListComponent } from './galpon-list.component';

describe('GalponListComponent', () => {
  let component: GalponListComponent;
  let fixture: ComponentFixture<GalponListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalponListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GalponListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
