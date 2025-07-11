import { TestBed } from '@angular/core/testing';
import { PropertyApiService } from './property-api.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { Property } from 'src/app/core/models/property.model';

describe('PropertyApiService (Jest)', () => {
  let service: PropertyApiService;
  let httpMock: jest.Mocked<HttpClient>;

  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Casa',
      location: 'Ciudad',
      price: 100000,
      area: 100,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      imageUrl: 'url1',
    },
    {
      id: '2',
      title: 'Apto',
      location: 'Ciudad',
      price: 200000,
      area: 80,
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      imageUrl: 'url2',
    },
  ];

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [
        PropertyApiService,
        { provide: HttpClient, useValue: httpMock },
      ],
    });

    service = TestBed.inject(PropertyApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get all properties and store them internally', (done) => {
    // Arrange
    const response = { data: mockProperties };
    httpMock.get.mockReturnValue(of(response));

    // Act
    service.getAll().subscribe((result) => {
      // Assert
      expect(result).toEqual(mockProperties);
      expect(httpMock.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/properties'
      );
      done();
    });
  });

  test('should get property by ID from cached array', () => {
    // Arrange
    (service as any).Properties = mockProperties;

    // Act
    service.getById('2').subscribe((property) => {
      // Assert
      expect(property).toEqual(mockProperties[1]);
    });
  });

  test('should call POST to create property', () => {
    // Arrange
    const newProperty: Property = { ...mockProperties[0], id: '3' };
    httpMock.post.mockReturnValue(of(newProperty));

    // Act
    service.create(newProperty).subscribe((result) => {
      // Assert
      expect(result).toEqual(newProperty);
      expect(httpMock.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/properties',
        newProperty
      );
    });
  });

  test('should update property and update cache', () => {
    // Arrange
    const updatedProperty: Property = {
      ...mockProperties[0],
      title: 'Casa Actualizada',
    };
    const response = { data: updatedProperty };
    (service as any).Properties = [...mockProperties];
    httpMock.put.mockReturnValue(of(response));

    // Act
    service.update('1', updatedProperty).subscribe((res) => {
      // Assert
      expect(res).toEqual(updatedProperty);
      expect((service as any).Properties[0].title).toBe('Casa Actualizada');
      expect(httpMock.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/properties/1',
        updatedProperty
      );
    });
  });

  test('should delete property and update cache', () => {
    // Arrange
    const updated = { ...mockProperties[0], title: 'Removed' };
    const response = { data: updated };
    (service as any).Properties = [...mockProperties];
    httpMock.delete.mockReturnValue(of(response));

    // Act
    service.delete('1').subscribe((res) => {
      // Assert
      expect(res).toEqual(updated);
      expect(httpMock.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/properties/1'
      );
    });
  });
});
