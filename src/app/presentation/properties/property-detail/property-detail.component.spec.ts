import { PropertyDetailComponent } from './property-detail.component';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { PropertyService } from 'src/app/application/services/property/property.service';
import { Property } from 'src/app/core/models/property.model';

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let propertyService: jest.Mocked<PropertyService>;
  let route: jest.Mocked<ActivatedRoute>;
  let snackBar: jest.Mocked<MatSnackBar>;
  let dialog: jest.Mocked<MatDialog>;
  let location: jest.Mocked<Location>;
  let router: jest.Mocked<Router>;

  const mockProperty: Property = {
    id: '123',
    title: 'Casa Bonita',
    location: 'Medellín',
    price: 500000000,
    area: 100,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    imageUrl: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    propertyService = {
      getById: jest.fn(),
    } as any;

    route = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('123'),
        },
      },
    } as any;

    snackBar = { open: jest.fn() } as any;
    dialog = {} as any;
    location = { back: jest.fn() } as any;
    router = { navigate: jest.fn() } as any;

    component = new PropertyDetailComponent(
      route,
      router,
      location,
      propertyService,
      snackBar,
      dialog
    );
  });

  describe('loadProperty', () => {
    it('debe cargar la propiedad exitosamente', () => {
      // Arrange
      propertyService.getById.mockReturnValue(of(mockProperty));

      // Act
      component.loadProperty();

      // Assert
      expect(propertyService.getById).toHaveBeenCalledWith('123');
      expect(component.property).toEqual(mockProperty);
      expect(component.loading).toBe(false);
    });

    it('debe manejar error si la propiedad no se puede cargar', () => {
      // Arrange
      const error = new Error('Error de carga');
      propertyService.getById.mockReturnValue(throwError(() => error));

      // Act
      component.loadProperty();

      // Assert
      expect(component.error).toBe(
        'No se pudo cargar la información de la propiedad'
      );
      expect(component.loading).toBe(false);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Error al cargar la propiedad',
        'Cerrar',
        expect.any(Object)
      );
    });
  });

  describe('getPricePerSquareMeter', () => {
    it('debe retornar el valor correcto', () => {
      // Arrange
      component.property = { ...mockProperty, price: 400000000, area: 100 };

      // Act
      const result = component.getPricePerSquareMeter();

      // Assert
      expect(result).toBe(4000000);
    });

    it('debe retornar 0 si no hay área', () => {
      component.property = { ...mockProperty, area: 0 };
      expect(component.getPricePerSquareMeter()).toBe(0);
    });
  });

  describe('addToFavorites', () => {
    it('debe agregar propiedad al localStorage y actualizar estado', () => {
      // Arrange
      localStorage.setItem('favorites', JSON.stringify([]));
      component.property = mockProperty;

      // Act
      component.addToFavorites();

      // Assert
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
      expect(stored).toContain('123');
      expect(component.isFavorite).toBe(true);
    });
  });

  describe('removeFromFavorites', () => {
    it('debe remover propiedad del localStorage y actualizar estado', () => {
      // Arrange
      localStorage.setItem('favorites', JSON.stringify(['123']));
      component.property = mockProperty;

      // Act
      component.removeFromFavorites();

      // Assert
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
      expect(stored).not.toContain('123');
      expect(component.isFavorite).toBe(false);
    });
  });

  describe('getPropertyTypeIcon', () => {
    it('debe retornar el ícono correcto para tipo "casa"', () => {
      component.property = { ...mockProperty, propertyType: 'casa' };
      expect(component.getPropertyTypeIcon()).toBe('home');
    });

    it('debe retornar "home" por defecto si no hay tipo', () => {
      component.property = { ...mockProperty, propertyType: undefined };
      expect(component.getPropertyTypeIcon()).toBe('home');
    });
  });

  describe('isPropertyComplete', () => {
    it('debe retornar true si la propiedad tiene todos los campos requeridos', () => {
      component.property = mockProperty;
      expect(component.isPropertyComplete()).toBe(true);
    });

    it('debe retornar false si falta algún campo', () => {
      component.property = { ...mockProperty, area: 0 };
      expect(component.isPropertyComplete()).toBe(false);
    });
  });
});
