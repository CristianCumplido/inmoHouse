import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyReportsComponent } from './property-reports.component';

describe('PropertyReportsComponent', () => {
  let component: PropertyReportsComponent;
  let fixture: ComponentFixture<PropertyReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyReportsComponent]
    });
    fixture = TestBed.createComponent(PropertyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
