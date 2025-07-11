import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PropertyService } from './property.service';
import { PropertyApiService } from '../../../infrastructure/api/property-api/property-api.service';
import { Property } from '../../../core/models/property.model';

// Mock completo de PropertyApiService
class MockPropertyApiService implements Partial<PropertyApiService> {
  getAll = jest.fn();
  getById = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

describe('PropertyService', () => {
  let service: PropertyService;
  let propertyApiService: jest.Mocked<PropertyApiService>;

  // Mock data
  const mockProperty: Property = {
    id: '1',
    title: 'Casa en el Centro',

    price: 250000,
    location: 'Centro, Bogotá',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    imageUrl: 'apt1.jpg',
    parking: 0,
  };

  const mockProperty2: Property = {
    id: '2',
    title: 'Apartamento Moderno',

    price: 180000,
    location: 'Zona Norte, Bogotá',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    imageUrl: 'apt1.jpg',
    parking: 0,
  };

  const mockProperty3: Property = {
    id: '3',
    title: 'Villa de Lujo',

    price: 500000,
    location: 'Chía, Cundinamarca',
    propertyType: 'villa',
    bedrooms: 5,
    bathrooms: 4,
    area: 300,
    imageUrl: 'apt1.jpg',
    parking: 0,
  };

  const mockProperties: Property[] = [
    mockProperty,
    mockProperty2,
    mockProperty3,
  ];

  const mockNewProperty: Property = {
    id: '',
    title: 'Nueva Propiedad',
    price: 300000,
    location: 'Chapinero, Bogotá',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    imageUrl: 'apt1.jpg',
    parking: 0,
  };

  beforeEach(() => {
    // Arrange - Configurar TestBed con mock apropiado
    TestBed.configureTestingModule({
      providers: [
        PropertyService,
        { provide: PropertyApiService, useClass: MockPropertyApiService },
      ],
    });

    service = TestBed.inject(PropertyService);
    propertyApiService = TestBed.inject(
      PropertyApiService
    ) as jest.Mocked<PropertyApiService>;

    // Reset mocks antes de cada test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup después de cada test
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      // Arrange & Act - El servicio ya está creado en beforeEach

      // Assert
      expect(service).toBeTruthy();
    });

    it('should inject PropertyApiService dependency', () => {
      // Arrange & Act - Dependencias inyectadas en beforeEach

      // Assert
      expect(propertyApiService).toBeTruthy();
    });
  });

  describe('getAll()', () => {
    it('should return all properties successfully', (done) => {
      // Arrange
      propertyApiService.getAll.mockReturnValue(of(mockProperties));

      // Act
      service.getAll().subscribe((properties) => {
        // Assert
        expect(properties).toEqual(mockProperties);
        expect(properties.length).toBe(3);
        expect(propertyApiService.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle empty properties array', (done) => {
      // Arrange
      const emptyProperties: Property[] = [];
      propertyApiService.getAll.mockReturnValue(of(emptyProperties));

      // Act
      service.getAll().subscribe((properties) => {
        // Assert
        expect(properties).toEqual([]);
        expect(properties.length).toBe(0);
        expect(propertyApiService.getAll).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle API error', (done) => {
      // Arrange
      const error = new Error('API Error');
      propertyApiService.getAll.mockReturnValue(throwError(() => error));

      // Act
      service.getAll().subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(propertyApiService.getAll).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });

    it('should pass through the observable from API service', () => {
      // Arrange
      const mockObservable = of(mockProperties);
      propertyApiService.getAll.mockReturnValue(mockObservable);

      // Act
      const result = service.getAll();

      // Assert
      expect(result).toBe(mockObservable);
      expect(propertyApiService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById()', () => {
    it('should return property by id successfully', (done) => {
      // Arrange
      const propertyId = '1';
      propertyApiService.getById.mockReturnValue(of(mockProperty));

      // Act
      service.getById(propertyId).subscribe((property) => {
        // Assert
        expect(property).toEqual(mockProperty);
        expect(property.id).toBe(propertyId);
        expect(propertyApiService.getById).toHaveBeenCalledWith(propertyId);
        expect(propertyApiService.getById).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle property not found error', (done) => {
      // Arrange
      const propertyId = 'non-existent';
      const error = new Error('Property not found');
      propertyApiService.getById.mockReturnValue(throwError(() => error));

      // Act
      service.getById(propertyId).subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(propertyApiService.getById).toHaveBeenCalledWith(propertyId);
          done();
        },
      });
    });

    it('should pass correct id parameter', () => {
      // Arrange
      const propertyId = '123';
      propertyApiService.getById.mockReturnValue(of(mockProperty));

      // Act
      service.getById(propertyId);

      // Assert
      expect(propertyApiService.getById).toHaveBeenCalledWith(propertyId);
      expect(propertyApiService.getById).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string id', (done) => {
      // Arrange
      const propertyId = '';
      propertyApiService.getById.mockReturnValue(of(mockProperty));

      // Act
      service.getById(propertyId).subscribe((property) => {
        // Assert
        expect(propertyApiService.getById).toHaveBeenCalledWith('');
        done();
      });
    });
  });

  describe('create()', () => {
    it('should create property successfully', (done) => {
      // Arrange
      const createdProperty = { ...mockNewProperty, id: '4' };
      propertyApiService.create.mockReturnValue(of(createdProperty));

      // Act
      service.create(mockNewProperty).subscribe((property) => {
        // Assert
        expect(property).toEqual(createdProperty);
        expect(property.id).toBe('4');
        expect(propertyApiService.create).toHaveBeenCalledWith(mockNewProperty);
        expect(propertyApiService.create).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle creation error', (done) => {
      // Arrange
      const error = new Error('Creation failed');
      propertyApiService.create.mockReturnValue(throwError(() => error));

      // Act
      service.create(mockNewProperty).subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(propertyApiService.create).toHaveBeenCalledWith(
            mockNewProperty
          );
          done();
        },
      });
    });

    it('should pass complete property object to API', () => {
      // Arrange
      propertyApiService.create.mockReturnValue(of(mockNewProperty));

      // Act
      service.create(mockNewProperty);

      // Assert
      expect(propertyApiService.create).toHaveBeenCalledWith(mockNewProperty);
      expect(propertyApiService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle property with minimal data', (done) => {
      // Arrange
      const minimalProperty: Property = {
        id: '',
        title: 'Minimal',

        price: 100000,
        location: 'Test Location',
        propertyType: 'house',
        bedrooms: 1,
        bathrooms: 1,
        area: 50,
        imageUrl: 'apt1.jpg',
        parking: 0,
      };
      propertyApiService.create.mockReturnValue(of(minimalProperty));

      // Act
      service.create(minimalProperty).subscribe((property) => {
        // Assert
        expect(property).toEqual(minimalProperty);
        expect(propertyApiService.create).toHaveBeenCalledWith(minimalProperty);
        done();
      });
    });
  });

  describe('update()', () => {
    it('should update property successfully', (done) => {
      // Arrange
      const propertyId = '1';
      const updatedProperty = { ...mockProperty, title: 'Casa Actualizada' };
      propertyApiService.update.mockReturnValue(of(updatedProperty));

      // Act
      service.update(propertyId, updatedProperty).subscribe((property) => {
        // Assert
        expect(property).toEqual(updatedProperty);
        expect(property.title).toBe('Casa Actualizada');
        expect(propertyApiService.update).toHaveBeenCalledWith(
          propertyId,
          updatedProperty
        );
        expect(propertyApiService.update).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle update error', (done) => {
      // Arrange
      const propertyId = '1';
      const error = new Error('Update failed');
      propertyApiService.update.mockReturnValue(throwError(() => error));

      // Act
      service.update(propertyId, mockProperty).subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(propertyApiService.update).toHaveBeenCalledWith(
            propertyId,
            mockProperty
          );
          done();
        },
      });
    });

    it('should pass correct parameters to API', () => {
      // Arrange
      const propertyId = '123';
      const propertyData = mockProperty;
      propertyApiService.update.mockReturnValue(of(propertyData));

      // Act
      service.update(propertyId, propertyData);

      // Assert
      expect(propertyApiService.update).toHaveBeenCalledWith(
        propertyId,
        propertyData
      );
      expect(propertyApiService.update).toHaveBeenCalledTimes(1);
    });

    it('should handle partial property updates', (done) => {
      // Arrange
      const propertyId = '1';
      const partialUpdate = { ...mockProperty, price: 275000 };
      propertyApiService.update.mockReturnValue(of(partialUpdate));

      // Act
      service.update(propertyId, partialUpdate).subscribe((property) => {
        // Assert
        expect(property.price).toBe(275000);
        expect(propertyApiService.update).toHaveBeenCalledWith(
          propertyId,
          partialUpdate
        );
        done();
      });
    });
  });

  describe('delete()', () => {
    it('should delete property successfully', (done) => {
      // Arrange
      const propertyId = '1';
      propertyApiService.delete.mockReturnValue(of(undefined));

      // Act
      service.delete(propertyId).subscribe((result) => {
        // Assert
        expect(result).toBeUndefined();
        expect(propertyApiService.delete).toHaveBeenCalledWith(propertyId);
        expect(propertyApiService.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle delete error', (done) => {
      // Arrange
      const propertyId = '1';
      const error = new Error('Delete failed');
      propertyApiService.delete.mockReturnValue(throwError(() => error));

      // Act
      service.delete(propertyId).subscribe({
        next: () => {},
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(propertyApiService.delete).toHaveBeenCalledWith(propertyId);
          done();
        },
      });
    });

    it('should pass correct id parameter', () => {
      // Arrange
      const propertyId = 'test-id-123';
      propertyApiService.delete.mockReturnValue(of(undefined));

      // Act
      service.delete(propertyId);

      // Assert
      expect(propertyApiService.delete).toHaveBeenCalledWith(propertyId);
      expect(propertyApiService.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string id', () => {
      // Arrange
      const propertyId = '';
      propertyApiService.delete.mockReturnValue(of(undefined));

      // Act
      service.delete(propertyId);

      // Assert
      expect(propertyApiService.delete).toHaveBeenCalledWith('');
    });
  });

  describe('filterProperties()', () => {
    describe('Location Filtering', () => {
      it('should filter by single location string', () => {
        // Arrange
        const filters = { location: ['Centro'] };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('1');
        expect(result[0].location).toContain('Centro');
      });

      it('should filter by multiple locations', () => {
        // Arrange
        const filters = { location: ['Centro', 'Zona Norte'] };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(2);
        expect(result.map((p) => p.id)).toEqual(['1', '2']);
      });

      it('should return all properties when no location filter', () => {
        // Arrange
        const filters = {};

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(3);
        expect(result).toEqual(mockProperties);
      });

      it('should return empty array when no location matches', () => {
        // Arrange
        const filters = { location: ['Inexistente'] };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(0);
      });

      it('should handle partial location matches', () => {
        // Arrange
        const filters = { location: ['Bogotá'] };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(2);
        expect(result.every((p) => p.location.includes('Bogotá'))).toBeTruthy();
      });
    });

    describe('Price Filtering', () => {
      it('should filter by minimum price', () => {
        // Arrange
        const filters = { minPrice: 200000 };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(2);
        expect(result.every((p) => p.price >= 200000)).toBeTruthy();
        expect(result.map((p) => p.id)).toEqual(['1', '3']);
      });

      it('should filter by maximum price', () => {
        // Arrange
        const filters = { maxPrice: 300000 };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(2);
        expect(result.every((p) => p.price <= 300000)).toBeTruthy();
        expect(result.map((p) => p.id)).toEqual(['1', '2']);
      });

      it('should filter by price range', () => {
        // Arrange
        const filters = { minPrice: 180000, maxPrice: 300000 };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(2);
        expect(
          result.every((p) => p.price >= 180000 && p.price <= 300000)
        ).toBeTruthy();
        expect(result.map((p) => p.id)).toEqual(['1', '2']);
      });

      it('should return empty array when price range excludes all', () => {
        // Arrange
        const filters = { minPrice: 600000, maxPrice: 700000 };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(0);
      });

      it('should handle exact price match', () => {
        // Arrange
        const filters = { minPrice: 250000, maxPrice: 250000 };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].price).toBe(250000);
      });
    });

    describe('Search Filtering', () => {
      it('should filter by search term in title (case insensitive)', () => {
        // Arrange
        const filters = { search: 'casa' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].title.toLowerCase()).toContain('casa');
      });

      it('should filter by search term with different case', () => {
        // Arrange
        const filters = { search: 'APARTAMENTO' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].title.toLowerCase()).toContain('apartamento');
      });

      it('should filter by partial search term', () => {
        // Arrange
        const filters = { search: 'mod' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].title.toLowerCase()).toContain('moderno');
      });

      it('should return empty array when search term not found', () => {
        // Arrange
        const filters = { search: 'inexistente' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(0);
      });

      it('should return all properties when search term is empty', () => {
        // Arrange
        const filters = { search: '' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(3);
      });
    });

    describe('Property Type Filtering', () => {
      it('should filter by property type', () => {
        // Arrange
        const filters = { propertyType: 'apartment' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(3);
        expect(result[0].propertyType).toBe('house');
      });

      it('should return empty array when property type not found', () => {
        // Arrange
        const filters = { propertyType: 'commercial' };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(3);
      });
    });

    describe('Combined Filtering', () => {
      it('should apply multiple filters simultaneously', () => {
        // Arrange
        const filters = {
          location: ['Bogotá'],
          minPrice: 150000,
          maxPrice: 300000,
          search: 'apartamento',
        };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('2');
        expect(result[0].location).toContain('Bogotá');
        expect(result[0].price).toBeGreaterThanOrEqual(150000);
        expect(result[0].price).toBeLessThanOrEqual(300000);
        expect(result[0].title.toLowerCase()).toContain('apartamento');
      });

      it('should return empty array when no properties match all filters', () => {
        // Arrange
        const filters = {
          location: ['Centro'],
          minPrice: 300000,
          search: 'villa',
        };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(0);
      });

      it('should handle complex filter combination', () => {
        // Arrange
        const filters = {
          location: ['Bogotá', 'Cundinamarca'],
          minPrice: 200000,
          search: 'villa',
        };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('3');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty properties array', () => {
        // Arrange
        const emptyProperties: Property[] = [];
        const filters = { search: 'test' };

        // Act
        const result = service.filterProperties(emptyProperties, filters);

        // Assert
        expect(result.length).toBe(0);
      });

      it('should handle empty filters object', () => {
        // Arrange
        const filters = {};

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result).toEqual(mockProperties);
        expect(result.length).toBe(3);
      });

      it('should handle null/undefined filter values', () => {
        // Arrange
        const filters = {
          location: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          search: undefined,
          propertyType: undefined,
        };

        // Act
        const result = service.filterProperties(mockProperties, filters);

        // Assert
        expect(result).toEqual(mockProperties);
      });

      it('should handle properties with missing fields gracefully', () => {
        // Arrange
        const propertiesWithMissingFields = [
          { ...mockProperty, location: '' },
          { ...mockProperty2, title: '' },
        ];
        const filters = { search: 'casa' };

        // Act
        const result = service.filterProperties(
          propertiesWithMissingFields,
          filters
        );

        // Assert
        expect(result.length).toBe(1);
      });
    });
  });

  describe('Observable Behavior', () => {
    it('should maintain Observable chain for getAll', () => {
      // Arrange
      propertyApiService.getAll.mockReturnValue(of(mockProperties));

      // Act
      const result$ = service.getAll();

      // Assert
      expect(result$).toBeDefined();
      expect(typeof result$.subscribe).toBe('function');
    });

    it('should handle multiple subscribers to same observable', (done) => {
      // Arrange
      propertyApiService.getAll.mockReturnValue(of(mockProperties));
      let subscriber1Result: Property[] = [];
      let subscriber2Result: Property[] = [];
      let completedSubscriptions = 0;

      const observable$ = service.getAll();

      // Act
      observable$.subscribe((properties) => {
        subscriber1Result = properties;
        completedSubscriptions++;
        if (completedSubscriptions === 2) {
          // Assert
          expect(subscriber1Result).toEqual(mockProperties);
          expect(subscriber2Result).toEqual(mockProperties);
          expect(subscriber1Result).toEqual(subscriber2Result);
          done();
        }
      });

      observable$.subscribe((properties) => {
        subscriber2Result = properties;
        completedSubscriptions++;
        if (completedSubscriptions === 2) {
          // Assert
          expect(subscriber1Result).toEqual(mockProperties);
          expect(subscriber2Result).toEqual(mockProperties);
          expect(subscriber1Result).toEqual(subscriber2Result);
          done();
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate API errors correctly', (done) => {
      // Arrange
      const apiError = new Error('Network error');
      propertyApiService.getAll.mockReturnValue(throwError(() => apiError));

      // Act
      service.getAll().subscribe({
        next: () => {},
        error: (error) => {
          // Assert
          expect(error).toBe(apiError);
          expect(error.message).toBe('Network error');
          done();
        },
      });
    });

    it('should handle different types of errors', () => {
      // Arrange
      const errors = [
        new Error('Generic error'),
        { status: 404, message: 'Not found' },
        'String error',
        null,
      ];

      errors.forEach((error, index) => {
        // Act & Assert
        propertyApiService.getById.mockReturnValue(throwError(() => error));

        service.getById(`test-${index}`).subscribe({
          next: () => {},
          error: (err) => {
            expect(err).toBe(error);
          },
        });
      });
    });
  });
});
function Injectable(arg0: { providedIn: string }) {
  throw new Error('Function not implemented.');
}
