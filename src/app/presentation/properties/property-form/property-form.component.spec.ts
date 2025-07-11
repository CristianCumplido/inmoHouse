import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PropertyFormComponent } from './property-form.component';
import { PropertyService } from 'src/app/application/services/property/property.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockProperty = {
  id: '123',
  title: 'Casa bonita',
  price: 100000000,
  location: 'Bogotá',
  imageUrl: 'https://example.com/image.jpg',
  area: 100,
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  propertyType: 'casa',
};

describe('PropertyFormComponent', () => {
  let component: PropertyFormComponent;
  let fixture: ComponentFixture<PropertyFormComponent>;
  let propertyServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let routeMock: any;

  beforeEach(async () => {
    propertyServiceMock = {
      getById: jest.fn().mockReturnValue(of(mockProperty)),
      create: jest.fn().mockReturnValue(of({})),
      update: jest.fn().mockReturnValue(of({})),
    };

    routerMock = { navigate: jest.fn() };
    locationMock = { back: jest.fn() };
    routeMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [PropertyFormComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatFormFieldModule,
        MatInputModule, // CRUCIAL: Necesario para que MatFormField funcione
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
      ],
      providers: [
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const formValue = component.form.value;
    expect(formValue.title).toBe('');
    expect(component.form.valid).toBeFalsy();
  });

  it('should mark form controls as touched if submit is called with invalid form', () => {
    const markSpy = jest.spyOn<any, any>(component, 'markFormGroupTouched');
    component.submit();
    expect(markSpy).toHaveBeenCalled();
  });

  it('should call createProperty if form is valid and not editing', () => {
    component.form.setValue({
      title: 'Casa nueva',
      price: 200000000,
      location: 'Medellín',
      imageUrl: 'https://img.com/house.jpg',
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      propertyType: 'casa',
    });
    const createSpy = jest.spyOn<any, any>(component, 'createProperty');
    component.submit();
    expect(createSpy).toHaveBeenCalled();
  });

  it('should call updateProperty if isEdit is true', () => {
    routeMock.snapshot.paramMap.get.mockReturnValue('123');
    component.isEdit = true;
    component.propertyId = '123';
    component.form.setValue({
      title: 'Casa actualizada',
      price: 250000000,
      location: 'Cali',
      imageUrl: 'https://img.com/casa.jpg',
      area: 140,
      bedrooms: 4,
      bathrooms: 2,
      parking: 1,
      propertyType: 'casa',
    });
    const updateSpy = jest.spyOn<any, any>(component, 'updateProperty');
    component.submit();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should load property in edit mode', () => {
    routeMock.snapshot.paramMap.get.mockReturnValue('123');
    component.isEdit = true;
    component.propertyId = '123';
    component.ngOnInit();
    expect(propertyServiceMock.getById).toHaveBeenCalledWith('123');
  });

  it('should show error message on getById error', () => {
    propertyServiceMock.getById.mockReturnValueOnce(
      throwError(() => new Error('Error'))
    );
    routeMock.snapshot.paramMap.get.mockReturnValue('123');
    component.isEdit = true;
    component.propertyId = '123';
    component.ngOnInit();
    expect(component.loading).toBe(false);
  });
});
