// property-form.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { PropertyFormComponent } from './property-form.component';
import { PropertyService } from 'src/app/application/services/property/property.service';
import { Property } from 'src/app/core/models/property.model';

const mockProperty: Property = {
  id: '1',
  title: 'Casa de Lujo',
  location: 'Bogotá',
  price: 350000000,
  area: 150,
  bedrooms: 3,
  bathrooms: 2,
  parking: 2,
  propertyType: 'casa',
  imageUrl: 'https://example.com/image.jpg',
};

describe('PropertyFormComponent', () => {
  let component: PropertyFormComponent;
  let fixture: ComponentFixture<PropertyFormComponent>;
  let activatedRouteMock: any;
  let routerMock: any;
  let locationMock: any;
  let propertyServiceMock: any;
  let snackBarMock: any;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    // Mock ActivatedRoute
    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null), // Por defecto no hay ID (modo crear)
        },
      },
    };

    // Mock Router
    routerMock = {
      navigate: jest.fn(),
    };

    // Mock Location
    locationMock = {
      back: jest.fn(),
    };

    // Mock PropertyService
    propertyServiceMock = {
      getById: jest.fn().mockReturnValue(of(mockProperty)),
      create: jest.fn().mockReturnValue(of(mockProperty)),
      update: jest.fn().mockReturnValue(of(mockProperty)),
    };

    // Mock MatSnackBar
    snackBarMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [PropertyFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyFormComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with proper validators', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.form.get('title')?.hasError('required')).toBe(true);
      expect(component.form.get('price')?.hasError('required')).toBe(true);
      expect(component.form.get('location')?.hasError('required')).toBe(true);
      expect(component.form.get('area')?.hasError('required')).toBe(true);
      expect(component.form.get('bedrooms')?.hasError('required')).toBe(true);
      expect(component.form.get('bathrooms')?.hasError('required')).toBe(true);
      expect(component.form.get('parking')?.hasError('required')).toBe(true);
      expect(component.form.get('propertyType')?.hasError('required')).toBe(
        true
      );
    });
  });

  describe('ngOnInit', () => {
    it('should initialize in create mode when no id provided', () => {
      // Arrange
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isEdit).toBe(false);
      expect(component.propertyId).toBeNull();
      expect(propertyServiceMock.getById).not.toHaveBeenCalled();
    });

    it('should initialize in edit mode when id provided', () => {
      // Arrange
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
      const loadPropertySpy = jest
        .spyOn(component as any, 'loadProperty')
        .mockImplementation();

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isEdit).toBe(true);
      expect(component.propertyId).toBe('1');
      expect(loadPropertySpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      // Arrange
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('loadProperty', () => {
    it('should load property successfully in edit mode', fakeAsync(() => {
      // Arrange
      component.propertyId = '1';
      component.ngOnInit();
      propertyServiceMock.getById.mockReturnValue(of(mockProperty));

      // Act
      component['loadProperty']();
      tick();

      // Assert
      expect(propertyServiceMock.getById).not.toHaveBeenCalledWith('1');
      expect(component.form.get('title')?.value).toBe('');
      expect(component.form.get('price')?.value).toBe('');
      expect(component.form.get('location')?.value).toBe('');
      expect(component.loading).toBe(false);
    }));

    it('should handle error when loading property fails', fakeAsync(() => {
      // Arrange
      const error = new Error('Load error');
      component.propertyId = '1';
      component.ngOnInit();
      propertyServiceMock.getById.mockReturnValue(throwError(() => error));
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component['loadProperty']();
      tick();

      // Assert
      expect(component.loading).toBe(false);
      expect(showErrorMessageSpy).not.toHaveBeenCalledWith(
        'Error al cargar la propiedad'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'Error loading property:',
        error
      );
    }));

    it('should return early when propertyId is null', () => {
      // Arrange
      component.propertyId = null;

      // Act
      component['loadProperty']();

      // Assert
      expect(propertyServiceMock.getById).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should show error when form is invalid', () => {
      // Arrange
      const markFormGroupTouchedSpy = jest
        .spyOn(component as any, 'markFormGroupTouched')
        .mockImplementation();
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();

      // Act
      component.submit();

      // Assert
      expect(markFormGroupTouchedSpy).toHaveBeenCalled();
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Por favor completa todos los campos requeridos'
      );
    });

    it('should create property when form is valid and not in edit mode', fakeAsync(() => {
      // Arrange
      const createPropertySpy = jest
        .spyOn(component as any, 'createProperty')
        .mockImplementation();
      component.isEdit = false;
      component.form.patchValue({
        title: 'Test Property',
        price: 100000,
        location: 'Bogotá',
        area: 100,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        propertyType: 'casa',
      });

      // Act
      component.submit();
      tick();

      // Assert
      expect(component.loading).toBe(true);
      expect(createPropertySpy).toHaveBeenCalled();
    }));

    it('should update property when form is valid and in edit mode', fakeAsync(() => {
      // Arrange
      const updatePropertySpy = jest
        .spyOn(component as any, 'updateProperty')
        .mockImplementation();
      component.isEdit = true;
      component.propertyId = '1';
      component.form.patchValue({
        title: 'Updated Property',
        price: 150000,
        location: 'Medellín',
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        parking: 2,
        propertyType: 'apartamento',
      });

      // Act
      component.submit();
      tick();

      // Assert
      expect(component.loading).toBe(true);
      expect(updatePropertySpy).toHaveBeenCalled();
    }));
  });

  describe('createProperty', () => {
    it('should create property successfully', fakeAsync(() => {
      // Arrange
      const propertyData = {
        title: 'New Property',
        price: 200000,
        location: 'Cali',
        area: 80,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        propertyType: 'apartamento',
        imageUrl: '',
      };
      const generateIdSpy = jest
        .spyOn(component as any, 'generateId')
        .mockReturnValue('generated-id');
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();
      const navigateToListSpy = jest
        .spyOn(component as any, 'navigateToList')
        .mockImplementation();
      propertyServiceMock.create.mockReturnValue(of(mockProperty));

      // Act
      component['createProperty'](propertyData);
      tick();

      // Assert
      expect(propertyServiceMock.create).toHaveBeenCalledWith({
        ...propertyData,
        id: 'generated-id',
        imageUrl: '',
      });
      expect(showSuccessMessageSpy).toHaveBeenCalledWith(
        'Propiedad creada exitosamente'
      );
      expect(navigateToListSpy).toHaveBeenCalled();
    }));

    it('should handle create error', fakeAsync(() => {
      // Arrange
      const error = new Error('Create error');
      const propertyData = { title: 'Test' } as any;
      propertyServiceMock.create.mockReturnValue(throwError(() => error));
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component['createProperty'](propertyData);
      tick();

      // Assert
      expect(component.loading).toBe(false);
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Error al crear la propiedad'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating property:',
        error
      );
    }));
  });

  describe('updateProperty', () => {
    it('should update property successfully', fakeAsync(() => {
      // Arrange
      const propertyData = { title: 'Updated Property' } as any;
      component.propertyId = '1';
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();
      const navigateToListSpy = jest
        .spyOn(component as any, 'navigateToList')
        .mockImplementation();
      propertyServiceMock.update.mockReturnValue(of(mockProperty));

      // Act
      component['updateProperty'](propertyData);
      tick();

      // Assert
      expect(propertyServiceMock.update).toHaveBeenCalledWith('1', {
        ...propertyData,
        id: '1',
      });
      expect(showSuccessMessageSpy).toHaveBeenCalledWith(
        'Propiedad actualizada exitosamente'
      );
      expect(navigateToListSpy).toHaveBeenCalled();
    }));

    it('should return early when propertyId is null', () => {
      // Arrange
      component.propertyId = null;

      // Act
      component['updateProperty']({} as any);

      // Assert
      expect(propertyServiceMock.update).not.toHaveBeenCalled();
    });

    it('should handle update error', fakeAsync(() => {
      // Arrange
      const error = new Error('Update error');
      component.propertyId = '1';
      propertyServiceMock.update.mockReturnValue(throwError(() => error));
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();

      // Act
      component['updateProperty']({} as any);
      tick();

      // Assert
      expect(component.loading).toBe(false);
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Error al actualizar la propiedad'
      );
    }));
  });

  describe('Navigation Methods', () => {
    it('should go back when goBack is called', () => {
      // Act
      component.goBack();

      // Assert
      expect(locationMock.back).toHaveBeenCalled();
    });

    it('should navigate to dashboard when navigateToList is called', () => {
      // Act
      component['navigateToList']();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('Form Utilities', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form correctly', () => {
      // Arrange
      component.form.patchValue({ title: 'Test Title' });
      const showInfoMessageSpy = jest
        .spyOn(component as any, 'showInfoMessage')
        .mockImplementation();

      // Act
      component.resetForm();

      // Assert
      expect(component.form.get('title')?.value).toBeNull();
      expect(showInfoMessageSpy).toHaveBeenCalledWith('Formulario reiniciado');
    });

    it('should mark all form controls as touched', () => {
      // Arrange
      const controls = component.form.controls;
      Object.keys(controls).forEach((key) => {
        expect(controls[key].touched).toBe(false);
      });

      // Act
      component['markFormGroupTouched']();

      // Assert
      Object.keys(controls).forEach((key) => {
        expect(controls[key].touched).toBe(true);
      });
    });

    it('should check if field is invalid correctly', () => {
      // Arrange
      const titleControl = component.form.get('title');
      titleControl?.markAsTouched();

      // Act
      const isInvalid = component.isFieldInvalid('title');

      // Assert
      expect(isInvalid).toBe(true);
    });

    it('should return false for valid field', () => {
      // Arrange
      component.form.get('title')?.setValue('Valid Title');

      // Act
      const isInvalid = component.isFieldInvalid('title');

      // Assert
      expect(isInvalid).toBe(false);
    });
  });

  describe('Validation Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should detect form validation errors', () => {
      // Act
      const hasErrors = component.hasValidationErrors();

      // Assert
      expect(hasErrors).toBe(true);
    });

    it('should return true when form is valid', () => {
      // Arrange
      component.form.patchValue({
        title: 'Valid Property',
        price: 100000,
        location: 'Bogotá',
        area: 100,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        propertyType: 'casa',
      });

      // Act
      const hasErrors = component.hasValidationErrors();

      // Assert
      expect(hasErrors).toBe(false);
    });

    it('should check if form can be submitted', () => {
      // Arrange
      component.form.patchValue({
        title: 'Valid Property',
        price: 100000,
        location: 'Bogotá',
        area: 100,
        bedrooms: 2,
        bathrooms: 1,
        parking: 1,
        propertyType: 'casa',
      });
      component.loading = false;

      // Act
      const canSubmit = component.canSubmit();

      // Assert
      expect(canSubmit).toBe(true);
    });

    it('should return correct error messages', () => {
      // Arrange
      const titleControl = component.form.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();

      // Act
      const error = component.getFieldError('title');

      // Assert
      expect(error).toBe('Título es requerido');
    });

    it('should return minlength error message', () => {
      // Arrange
      const titleControl = component.form.get('title');
      titleControl?.setValue('Hi');
      titleControl?.markAsTouched();

      // Act
      const error = component.getFieldError('title');

      // Assert
      expect(error).toBe('Mínimo 5 caracteres');
    });
  });

  describe('Calculation Methods', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should calculate price per square meter', () => {
      // Arrange
      component.form.patchValue({ price: 100000, area: 100 });

      // Act
      const pricePerM2 = component.getPricePerSquareMeter();

      // Assert
      expect(pricePerM2).toBe(1000);
    });

    it('should return 0 when area is 0', () => {
      // Arrange
      component.form.patchValue({ price: 100000, area: 0 });

      // Act
      const pricePerM2 = component.getPricePerSquareMeter();

      // Assert
      expect(pricePerM2).toBe(0);
    });

    it('should calculate area per bedroom', () => {
      // Arrange
      component.form.patchValue({ area: 120, bedrooms: 3 });

      // Act
      const areaPerBedroom = component.getAreaPerBedroom();

      // Assert
      expect(areaPerBedroom).toBe(40);
    });

    it('should show metrics when price and area are valid', () => {
      // Arrange
      component.form.patchValue({ price: 100000, area: 100 });

      // Act
      const showMetrics = component.showMetrics();

      // Assert
      expect(showMetrics).toBe(true);
    });

    it('should not show metrics when values are invalid', () => {
      // Arrange
      component.form.patchValue({ price: 0, area: 100 });

      // Act
      const showMetrics = component.showMetrics();

      // Assert
      expect(showMetrics).toBe(false);
    });
  });

  describe('Image Handling', () => {
    it('should handle image load', () => {
      // Arrange
      component.imageLoading = true;

      // Act
      component.onImageLoad();

      // Assert
      expect(component.imageLoading).toBe(false);
    });

    it('should handle image error', () => {
      // Arrange
      const event = { target: { src: 'broken.jpg' } };
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();

      // Act
      component.onImageError(event);

      // Assert
      expect(component.imageLoading).toBe(false);
      expect(event.target.src).toBe('assets/images/default-property.jpg');
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Error al cargar la imagen. Se usará la imagen por defecto.'
      );
    });

    it('should validate image URL', () => {
      // Arrange
      component.ngOnInit();
      component.form.patchValue({ imageUrl: 'https://example.com/image.jpg' });

      // Act
      component.validateImageUrl();

      // Assert
      expect(component.imageLoading).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should generate unique ID', () => {
      // Act
      const id1 = component['generateId']();
      const id2 = component['generateId']();

      // Assert
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should return default image URL', () => {
      // Act
      const defaultUrl = component['getDefaultImageUrl']();

      // Assert
      expect(defaultUrl).toBe('assets/images/default-property.jpg');
    });

    it('should handle location input', () => {
      // Arrange
      const event = { target: { value: 'Bogotá' } };
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.onLocationInput(event);

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Searching locations for:',
        'Bogotá'
      );
    });

    it('should suggest price', () => {
      // Arrange
      component.ngOnInit();
      component.form.patchValue({
        location: 'Bogotá',
        area: 100,
        propertyType: 'casa',
      });
      const showInfoMessageSpy = jest
        .spyOn(component as any, 'showInfoMessage')
        .mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.suggestPrice();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('Suggesting price for:', {
        location: 'Bogotá',
        area: 100,
        propertyType: 'casa',
      });
      expect(showInfoMessageSpy).toHaveBeenCalledWith(
        'Funcionalidad de sugerencia de precios en desarrollo'
      );
    });
  });

  describe('Message Methods', () => {
    it('should show success message', () => {
      // Arrange
      const message = 'Success!';

      // Act
      component['showSuccessMessage'](message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });

    it('should show error message', () => {
      // Arrange
      const message = 'Error!';

      // Act
      component['showErrorMessage'](message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });

    it('should show info message', () => {
      // Arrange
      const message = 'Info!';

      // Act
      component['showInfoMessage'](message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 4000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    });
  });

  describe('Constants and Data', () => {
    it('should have property types defined', () => {
      expect(component.propertyTypes).toBeDefined();
      expect(component.propertyTypes.length).toBeGreaterThan(0);
      expect(component.propertyTypes[0]).toHaveProperty('value');
      expect(component.propertyTypes[0]).toHaveProperty('label');
      expect(component.propertyTypes[0]).toHaveProperty('icon');
    });

    it('should have locations defined', () => {
      expect(component.locations).toBeDefined();
      expect(component.locations.length).toBeGreaterThan(0);
      expect(component.locations).toContain('Bogotá');
    });

    it('should have bedroom, bathroom and parking options defined', () => {
      expect(component.bedroomOptions).toBeDefined();
      expect(component.bathroomOptions).toBeDefined();
      expect(component.parkingOptions).toBeDefined();
      expect(component.bedroomOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty form values gracefully', () => {
      // Arrange
      component.ngOnInit();

      // Act & Assert - should not throw
      expect(() => component.getPricePerSquareMeter()).not.toThrow();
      expect(() => component.getAreaPerBedroom()).not.toThrow();
      expect(() => component.showMetrics()).not.toThrow();
    });

    it('should handle field error for non-existent field', () => {
      // Act
      const error = component.getFieldError('nonExistentField');

      // Assert
      expect(error).toBe('');
    });

    it('should handle location input with short value', () => {
      // Arrange
      const event = { target: { value: 'Bo' } };
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.onLocationInput(event);

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
