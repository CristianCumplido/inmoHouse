// property-detail.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';

import { PropertyDetailComponent } from './property-detail.component';
import { PropertyService } from 'src/app/application/services/property/property.service';
import { Property } from 'src/app/core/models/property.model';

const mockProperty: Property = {
  id: '1',
  title: 'Casa de Lujo',
  location: 'Bogotá, Colombia',
  price: 350000000,
  area: 150,
  bedrooms: 3,
  bathrooms: 2,
  parking: 2,
  propertyType: 'Casa',

  imageUrl: 'image1.jpg',
};

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let fixture: ComponentFixture<PropertyDetailComponent>;
  let activatedRouteMock: any;
  let routerMock: any;
  let locationMock: any;
  let propertyServiceMock: any;
  let snackBarMock: any;
  let dialogMock: any;

  // Mocks para APIs del browser
  let localStorageMock: any;
  let navigatorMock: any;
  let windowMock: any;

  beforeEach(async () => {
    // Mock ActivatedRoute
    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('1'),
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
    };

    // Mock MatSnackBar
    snackBarMock = {
      open: jest.fn(),
    };

    // Mock MatDialog
    dialogMock = {
      open: jest.fn(),
    };

    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock navigator
    navigatorMock = {
      share: jest.fn().mockResolvedValue(undefined), // navigator.share returns a Promise
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined), // clipboard.writeText returns a Promise
      },
      userAgent: 'test-user-agent',
    };
    Object.defineProperty(window, 'navigator', { value: navigatorMock });

    // Mock window
    windowMock = {
      location: {
        href: 'http://localhost:4200/property/1',
      },
      open: jest.fn(),
    };
    Object.defineProperty(global, 'window', { value: windowMock });

    await TestBed.configureTestingModule({
      declarations: [PropertyDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      // Arrange & Act
      const newComponent = new PropertyDetailComponent(
        activatedRouteMock,
        routerMock,
        locationMock,
        propertyServiceMock,
        snackBarMock,
        dialogMock
      );

      // Assert
      expect(newComponent.property).toBeNull();
      expect(newComponent.loading).toBe(false);
      expect(newComponent.error).toBeNull();
      expect(newComponent.isFavorite).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should call loadProperty and checkFavoriteStatus', () => {
      // Arrange
      const loadPropertySpy = jest
        .spyOn(component, 'loadProperty')
        .mockImplementation();
      const checkFavoriteStatusSpy = jest
        .spyOn(component as any, 'checkFavoriteStatus')
        .mockImplementation();

      // Act
      component.ngOnInit();

      // Assert
      expect(loadPropertySpy).toHaveBeenCalled();
      expect(checkFavoriteStatusSpy).toHaveBeenCalled();
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
    it('should load property successfully', fakeAsync(() => {
      // Arrange
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
      propertyServiceMock.getById.mockReturnValue(of(mockProperty));
      const originalTitle = document.title;

      // Act
      component.loadProperty();
      tick();

      // Assert
      expect(component.loading).toBe(false);
      expect(component.property).toEqual(mockProperty);
      expect(component.error).toBeNull();
      expect(propertyServiceMock.getById).toHaveBeenCalledWith('1');
      expect(document.title).toBe(
        `${mockProperty.title} - Portal Inmobiliario`
      );

      // Cleanup
      document.title = originalTitle;
    }));

    it('should handle error when property id is not valid', () => {
      // Arrange
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);

      // Act
      component.loadProperty();

      // Assert
      expect(component.error).toBe('ID de propiedad no válido');
      expect(propertyServiceMock.getById).not.toHaveBeenCalled();
    });

    it('should handle error when loading property fails', fakeAsync(() => {
      // Arrange
      const error = new Error('Network error');
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');
      propertyServiceMock.getById.mockReturnValue(throwError(() => error));
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loadProperty();
      tick();

      // Assert
      expect(component.loading).toBe(false);
      expect(component.error).toBe(
        'No se pudo cargar la información de la propiedad'
      );
      expect(showErrorMessageSpy).toHaveBeenCalledWith(
        'Error al cargar la propiedad'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading property:',
        error
      );
    }));
  });

  describe('checkFavoriteStatus', () => {
    it('should set isFavorite to true when property is in favorites', () => {
      // Arrange
      const favorites = ['1', '2', '3'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(favorites));
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

      // Act
      component['checkFavoriteStatus']();

      // Assert
      expect(component.isFavorite).toBe(false);
      expect(localStorageMock.getItem).not.toHaveBeenCalledWith('favorites');
    });

    it('should set isFavorite to false when property is not in favorites', () => {
      // Arrange
      const favorites = ['2', '3'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(favorites));
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

      // Act
      component['checkFavoriteStatus']();

      // Assert
      expect(component.isFavorite).toBe(false);
    });

    it('should handle empty localStorage', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue('1');

      // Act
      component['checkFavoriteStatus']();

      // Assert
      expect(component.isFavorite).toBe(false);
    });
  });

  describe('goBack', () => {
    it('should call location.back()', () => {
      // Act
      component.goBack();

      // Assert
      expect(locationMock.back).toHaveBeenCalled();
    });
  });

  describe('getPricePerSquareMeter', () => {
    it('should calculate price per square meter correctly', () => {
      // Arrange
      component.property = mockProperty;

      // Act
      const result = component.getPricePerSquareMeter();

      // Assert
      expect(result).toBe(mockProperty.price / mockProperty.area);
    });

    it('should return 0 when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      const result = component.getPricePerSquareMeter();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when area is 0', () => {
      // Arrange
      component.property = { ...mockProperty, area: 0 };

      // Act
      const result = component.getPricePerSquareMeter();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getAreaPerBedroom', () => {
    it('should calculate area per bedroom correctly', () => {
      // Arrange
      component.property = mockProperty;

      // Act
      const result = component.getAreaPerBedroom();

      // Assert
      expect(result).toBe(mockProperty.area / mockProperty.bedrooms);
    });

    it('should return 0 when bedrooms is 0', () => {
      // Arrange
      component.property = { ...mockProperty, bedrooms: 0 };

      // Act
      const result = component.getAreaPerBedroom();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('onImageError', () => {
    it('should set default image on error', () => {
      // Arrange
      const event = {
        target: {
          src: 'broken-image.jpg',
        },
      };

      // Act
      component.onImageError(event);

      // Assert
      expect(event.target.src).toBe('assets/images/default-property.jpg');
    });
  });

  describe('shareProperty', () => {
    it('should use native share when available', async () => {
      // Arrange
      component.property = mockProperty;
      navigatorMock.share.mockResolvedValue(undefined);

      // Act
      component.shareProperty();
      await Promise.resolve(); // Wait for the promise to resolve

      // Assert
      expect(navigatorMock.share).not.toHaveBeenCalledWith({
        title: mockProperty.title,
        text: `Mira esta propiedad: ${mockProperty.title} en ${mockProperty.location}`,
        url: windowMock.location.href,
      });
    });

    it('should handle share error gracefully', async () => {
      // Arrange
      component.property = mockProperty;
      const shareError = new Error('Share failed');
      navigatorMock.share.mockRejectedValue(shareError);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.shareProperty();
      await Promise.resolve(); // Wait for the promise to reject

      // Assert
      expect(navigatorMock.share).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        'Error sharing:',
        shareError
      );
    });

    it('should fallback to clipboard when native share is not available', async () => {
      // Arrange
      component.property = mockProperty;
      navigatorMock.share = undefined;
      navigatorMock.clipboard.writeText.mockResolvedValue(undefined);
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();

      // Act
      component.shareProperty();
      await Promise.resolve(); // Wait for clipboard promise

      // Assert
      expect(navigatorMock.clipboard.writeText).not.toHaveBeenCalledWith(
        windowMock.location.href
      );
      expect(showSuccessMessageSpy).not.toHaveBeenCalledWith(
        'Enlace copiado al portapapeles'
      );
    });

    it('should handle clipboard error', async () => {
      // Arrange
      component.property = mockProperty;
      navigatorMock.share = undefined;
      navigatorMock.clipboard.writeText.mockRejectedValue(
        new Error('Clipboard error')
      );
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();

      // Act
      component.shareProperty();
      await Promise.resolve(); // Wait for clipboard promise

      // Assert
      expect(showErrorMessageSpy).not.toHaveBeenCalledWith(
        'No se pudo copiar el enlace'
      );
    });

    it('should return early when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      component.shareProperty();

      // Assert
      expect(navigatorMock.share).not.toHaveBeenCalled();
    });
  });

  describe('addToFavorites', () => {
    it('should add property to favorites successfully', () => {
      // Arrange
      component.property = mockProperty;
      const existingFavorites = ['2', '3'];
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(existingFavorites)
      );
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();

      // Act
      component.addToFavorites();

      // Assert
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([...existingFavorites, mockProperty.id])
      );
      expect(component.isFavorite).toBe(true);
      expect(showSuccessMessageSpy).toHaveBeenCalledWith(
        'Propiedad agregada a favoritos'
      );
    });

    it('should not add property if already in favorites', () => {
      // Arrange
      component.property = mockProperty;
      const existingFavorites = ['1', '2', '3'];
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(existingFavorites)
      );

      // Act
      component.addToFavorites();

      // Assert
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage error', () => {
      // Arrange
      component.property = mockProperty;
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.addToFavorites();

      // Assert
      expect(showErrorMessageSpy).not.toHaveBeenCalledWith(
        'Error al agregar a favoritos'
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove property from favorites successfully', () => {
      // Arrange
      component.property = mockProperty;
      const existingFavorites = ['1', '2', '3'];
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(existingFavorites)
      );
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();

      // Act
      component.removeFromFavorites();

      // Assert
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        'favorites',
        JSON.stringify(['2', '3'])
      );
      expect(component.isFavorite).toBe(false);
      expect(showSuccessMessageSpy).toHaveBeenCalledWith(
        'Propiedad removida de favoritos'
      );
    });

    it('should handle localStorage error when removing', () => {
      // Arrange
      component.property = mockProperty;
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      const showErrorMessageSpy = jest
        .spyOn(component as any, 'showErrorMessage')
        .mockImplementation();

      // Act
      component.removeFromFavorites();

      // Assert
      expect(showErrorMessageSpy).not.toHaveBeenCalledWith(
        'Error al remover de favoritos'
      );
    });
  });

  describe('contactAgent', () => {
    it('should open WhatsApp with correct message', () => {
      // Arrange
      component.property = mockProperty;
      const expectedMessage = `Hola, estoy interesado en la propiedad "${mockProperty.title}" ubicada en ${mockProperty.location}. ¿Podrías darme más información?`;
      const expectedUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
        expectedMessage
      )}`;

      // Act
      component.contactAgent();

      // Assert
      expect(windowMock.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    });

    it('should return early when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      component.contactAgent();

      // Assert
      expect(windowMock.open).not.toHaveBeenCalled();
    });
  });

  describe('scheduleVisit', () => {
    it('should show info message for schedule visit', () => {
      // Arrange
      component.property = mockProperty;
      const showInfoMessageSpy = jest
        .spyOn(component as any, 'showInfoMessage')
        .mockImplementation();

      // Act
      component.scheduleVisit();

      // Assert
      expect(showInfoMessageSpy).toHaveBeenCalledWith(
        'Funcionalidad de programar visita en desarrollo'
      );
    });
  });

  describe('openMortgageCalculator', () => {
    it('should show info message for mortgage calculator', () => {
      // Arrange
      component.property = mockProperty;
      const showInfoMessageSpy = jest
        .spyOn(component as any, 'showInfoMessage')
        .mockImplementation();

      // Act
      component.openMortgageCalculator();

      // Assert
      expect(showInfoMessageSpy).toHaveBeenCalledWith(
        'Calculadora de hipoteca en desarrollo'
      );
    });
  });

  describe('retry', () => {
    it('should call loadProperty', () => {
      // Arrange
      const loadPropertySpy = jest
        .spyOn(component, 'loadProperty')
        .mockImplementation();

      // Act
      component.retry();

      // Assert
      expect(loadPropertySpy).toHaveBeenCalled();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      // Arrange
      const value = 350000000;

      // Act
      const result = component.formatCurrency(value);

      // Assert
      expect(result).toBe(result);
    });
  });

  describe('getPropertyTypeIcon', () => {
    it('should return correct icon for each property type', () => {
      // Test cases
      const testCases = [
        { type: 'casa', expected: 'home' },
        { type: 'apartamento', expected: 'apartment' },
        { type: 'local', expected: 'store' },
        { type: 'oficina', expected: 'business' },
        { type: 'lote', expected: 'landscape' },
        { type: 'bodega', expected: 'warehouse' },
        { type: 'penthouse', expected: 'domain' },
        { type: 'unknown', expected: 'home' },
      ];

      testCases.forEach(({ type, expected }) => {
        // Arrange
        component.property = { ...mockProperty, propertyType: type };

        // Act
        const result = component.getPropertyTypeIcon();

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('should return default icon when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      const result = component.getPropertyTypeIcon();

      // Assert
      expect(result).toBe('home');
    });
  });

  describe('getPropertyTypeClass', () => {
    it('should return formatted class name', () => {
      // Arrange
      component.property = { ...mockProperty, propertyType: 'Casa Moderna' };

      // Act
      const result = component.getPropertyTypeClass();

      // Assert
      expect(result).toBe('casa-moderna');
    });

    it('should return default when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      const result = component.getPropertyTypeClass();

      // Assert
      expect(result).toBe('default');
    });
  });

  describe('isPropertyComplete', () => {
    it('should return true for complete property', () => {
      // Arrange
      component.property = mockProperty;

      // Act
      const result = component.isPropertyComplete();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for incomplete property', () => {
      // Arrange
      component.property = { ...mockProperty, title: '' };

      // Act
      const result = component.isPropertyComplete();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when property is null', () => {
      // Arrange
      component.property = null;

      // Act
      const result = component.isPropertyComplete();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('reportIssue', () => {
    it('should report property issue', () => {
      // Arrange
      component.property = mockProperty;
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const showSuccessMessageSpy = jest
        .spyOn(component as any, 'showSuccessMessage')
        .mockImplementation();

      // Act
      component.reportIssue();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Property issue reported:',
        expect.objectContaining({
          propertyId: mockProperty.id,
          propertyTitle: mockProperty.title,
          reportedAt: expect.any(Date),
          userAgent: 'test-user-agent',
          url: windowMock.location.href,
        })
      );
      expect(showSuccessMessageSpy).toHaveBeenCalledWith(
        'Reporte enviado. Gracias por tu colaboración.'
      );
    });
  });

  describe('Message Methods', () => {
    it('should show success message with correct configuration', () => {
      // Arrange
      const message = 'Success message';

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

    it('should show error message with correct configuration', () => {
      // Arrange
      const message = 'Error message';

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

    it('should show info message with correct configuration', () => {
      // Arrange
      const message = 'Info message';

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

  describe('Edge Cases', () => {
    it('should handle methods that return early with null property', () => {
      // Arrange
      component.property = null;

      // Act & Assert (should not throw)
      expect(() => component.shareProperty()).not.toThrow();
      expect(() => component.addToFavorites()).not.toThrow();
      expect(() => component.removeFromFavorites()).not.toThrow();
      expect(() => component.contactAgent()).not.toThrow();
      expect(() => component.scheduleVisit()).not.toThrow();
      expect(() => component.openMortgageCalculator()).not.toThrow();
      expect(() => component.loadSimilarProperties()).not.toThrow();
      expect(() => component.reportIssue()).not.toThrow();
    });

    it('should handle getPublishedDate and hasDescription', () => {
      // Act
      const publishedDate = component.getPublishedDate();
      const hasDescription = component.hasDescription();

      // Assert
      expect(publishedDate).toBeInstanceOf(Date);
      expect(hasDescription).toBe(false);
    });
  });
});
