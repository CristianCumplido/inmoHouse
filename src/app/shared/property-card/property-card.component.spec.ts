import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyCardComponent } from './property-card.component';
import { RoleService } from 'src/app/application/services/role/role.service';
import { Property } from 'src/app/core/models/property.model';
import { Component } from '@angular/core';

describe('PropertyCardComponent (Jest)', () => {
  let component: PropertyCardComponent;
  let fixture: ComponentFixture<PropertyCardComponent>;

  const mockRoleService = {
    isAdmin: jest.fn(),
    isAgent: jest.fn(),
  };

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      declarations: [PropertyCardComponent],
      providers: [{ provide: RoleService, useValue: mockRoleService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCardComponent);
    component = fixture.componentInstance;

    // Input setup
    component.property = {
      id: '1',
      title: 'Casa Bonita',
      imageUrl: 'https://example.com/image.jpg', // ✅ nombre correcto
      location: 'Cartagena',
      price: 500000,
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      propertyType: 'Apartamento',
      featured: true,
    } as Property;

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  test('should return false for canContact if user is admin', () => {
    // Arrange
    mockRoleService.isAdmin.mockReturnValue(true);
    mockRoleService.isAgent.mockReturnValue(false);

    // Act
    const result = component.canContact;

    // Assert
    expect(result).toBe(false);
  });

  test('should return false for canContact if user is agent', () => {
    // Arrange
    mockRoleService.isAdmin.mockReturnValue(false);
    mockRoleService.isAgent.mockReturnValue(true);

    // Act
    const result = component.canContact;

    // Assert
    expect(result).toBe(false);
  });

  test('should return true for canContact if user is not admin or agent', () => {
    // Arrange
    mockRoleService.isAdmin.mockReturnValue(false);
    mockRoleService.isAgent.mockReturnValue(false);

    // Act
    const result = component.canContact;

    // Assert
    expect(result).toBe(true);
  });
});
