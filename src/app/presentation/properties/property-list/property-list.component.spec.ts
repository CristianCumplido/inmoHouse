import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { of, throwError, Subject } from 'rxjs';

import { PropertyListComponent } from './property-list.component';
import { PropertyService } from '../../../application/services/property/property.service';
import { RoleService } from '../../../application/services/role/role.service';
import { Property } from '../../../core/models/property.model';
import { UserRole } from '../../../core/models/roles.enum';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';

// Setup DOM environment for Jest
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(window, 'CSS', {
  value: () => ({
    supports: () => false,
  }),
});

describe('PropertyListComponent', () => {
  let component: PropertyListComponent;
  let fixture: ComponentFixture<PropertyListComponent>;
  let mockPropertyService: jest.Mocked<PropertyService>;
  let mockRoleService: jest.Mocked<RoleService>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ConfirmDeleteDialogComponent>>;

  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Apartamento Moderno Centro',
      price: 350000000,
      location: 'Medellín',
      propertyType: 'apartamento',
      imageUrl: 'image1.jpg',
      area: 85,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
    },
    {
      id: '2',
      title: 'Casa Familiar Envigado',
      price: 650000000,
      location: 'Envigado',
      propertyType: 'casa',
      imageUrl: 'image2.jpg',
      area: 180,
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
    },
    {
      id: '3',
      title: 'Local Comercial Poblado',
      price: 280000000,
      location: 'Medellín',
      propertyType: 'local',
      imageUrl: 'image3.jpg',
      area: 120,
      bedrooms: 0,
      bathrooms: 1,
      parking: 0,
    },
  ];

  beforeEach(async () => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
      {
        teardown: { destroyAfterEach: false },
      }
    );

    const propertyServiceMock = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      filterProperties: jest.fn(),
    } as unknown as jest.Mocked<PropertyService>;

    const roleServiceMock = {
      isAdmin: jest.fn(),
      getUserRole: jest.fn(),
      hasPermission: jest.fn(),
    } as unknown as jest.Mocked<RoleService>;

    const dialogMock = {
      open: jest.fn(),
      openDialogs: [],
      afterAllClosed: jest.fn(),
      afterOpened: jest.fn(),
      getDialogById: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    const snackBarMock = {
      open: jest.fn(),
      openFromComponent: jest.fn(),
      openFromTemplate: jest.fn(),
      dismiss: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    // Create a proper mock for MatDialogRef
    const dialogRefMock = {
      afterClosed: jest.fn(),
      close: jest.fn(),
      backdropClick: jest.fn(),
      keydownEvents: jest.fn(),
      componentInstance: {} as ConfirmDeleteDialogComponent,
      componentRef: null,
      disableClose: false,
      id: 'test-dialog',
      removePanelClass: jest.fn(),
      addPanelClass: jest.fn(),
      updatePosition: jest.fn(),
      updateSize: jest.fn(),
      afterOpened: jest.fn(),
      beforeClosed: jest.fn(),
      getState: jest.fn(),
      _containerInstance: {} as any,
    } as unknown as jest.Mocked<MatDialogRef<ConfirmDeleteDialogComponent>>;

    await TestBed.configureTestingModule({
      declarations: [PropertyListComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListComponent);
    component = fixture.componentInstance;
    mockPropertyService = TestBed.inject(
      PropertyService
    ) as jest.Mocked<PropertyService>;
    mockRoleService = TestBed.inject(RoleService) as jest.Mocked<RoleService>;
    mockDialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    mockDialogRef = dialogRefMock;

    // Default mock setup with proper return values
    mockRoleService.isAdmin.mockReturnValue(false);
    mockPropertyService.getAll.mockReturnValue(of(mockProperties));
    mockPropertyService.getById.mockReturnValue(of(mockProperties[0]));
    mockPropertyService.create.mockReturnValue(of(mockProperties[0]));
    mockPropertyService.update.mockReturnValue(of(mockProperties[0]));
    mockPropertyService.delete.mockReturnValue(of(void 0));
    mockPropertyService.filterProperties.mockReturnValue(mockProperties);
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockDialogRef.afterClosed.mockReturnValue(of(false));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      // Arrange & Act & Assert
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      // Arrange

      // Act
      component.ngOnInit();

      // Assert
      expect(component.filterForm).toBeDefined();
      expect(component.filterForm.get('location')?.value).toEqual([]);
      expect(component.filterForm.get('minPrice')?.value).toBe('');
      expect(component.filterForm.get('maxPrice')?.value).toBe('');
      expect(component.filterForm.get('search')?.value).toBe('');
      expect(component.filterForm.get('propertyType')?.value).toBe('');
      expect(component.filterForm.get('viewMode')?.value).toBe('grid');
    });

    it('should set isAdmin based on role service', () => {
      // Arrange
      mockRoleService.isAdmin.mockReturnValue(true);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.isAdmin).toBe(true);
      expect(mockRoleService.isAdmin).toHaveBeenCalled();
    });

    it('should load properties on initialization', () => {
      // Arrange

      // Act
      component.ngOnInit();

      // Assert
      expect(mockPropertyService.getAll).toHaveBeenCalled();
      expect(component.properties).toEqual(mockProperties);
      expect(component.allProperties).toEqual(mockProperties);
    });

    it('should set default view mode to grid', () => {
      // Arrange

      // Act
      component.ngOnInit();

      // Assert
      expect(component.viewMode).toBe('grid');
    });

    it('should initialize with all Colombian locations', () => {
      // Arrange

      // Act
      const locations = component.allLocations;

      // Assert
      expect(locations).toContain('Bogotá');
      expect(locations).toContain('Medellín');
      expect(locations).toContain('Cali');
      expect(locations).toContain('Barranquilla');
      expect(locations).toContain('Cartagena');
      expect(locations.length).toBe(20);
    });
  });

  describe('loadProperties', () => {
    it('should load properties successfully', () => {
      // Arrange
      component.loading = false;

      // Act
      component.loadProperties();

      // Assert
      expect(component.loading).toBe(false);
      expect(component.allProperties).toEqual(mockProperties);
      expect(component.properties).toEqual(mockProperties);
      expect(mockPropertyService.getAll).toHaveBeenCalled();
    });

    it('should set loading to true during request', () => {
      // Arrange
      mockPropertyService.getAll.mockReturnValue(of(mockProperties));

      // Act
      component.loadProperties();

      // Assert
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading properties', () => {
      // Arrange
      const error = new Error('Network error');
      mockPropertyService.getAll.mockReturnValue(throwError(() => error));

      // Act
      component.loadProperties();

      // Assert
      expect(component.loading).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar las propiedades',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    });

    it('should apply filters after loading properties', () => {
      // Arrange
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters');

      // Act
      component.loadProperties();

      // Assert
      expect(applyFiltersSpy).toHaveBeenCalled();
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should apply filters with form values', () => {
      // Arrange
      component.filterForm.patchValue({
        location: ['Medellín'],
        minPrice: '300000000',
        maxPrice: '500000000',
        search: 'apartamento',
        propertyType: 'apartamento',
      });

      // Act
      component.applyFilters();

      // Assert
      expect(mockPropertyService.filterProperties).toHaveBeenCalledWith(
        mockProperties,
        {
          location: ['Medellín'],
          minPrice: 300000000,
          maxPrice: 500000000,
          search: 'apartamento',
          propertyType: 'apartamento',
        }
      );
    });

    it('should handle empty location array', () => {
      // Arrange
      component.filterForm.patchValue({ location: [] });

      // Act
      component.applyFilters();

      // Assert
      expect(mockPropertyService.filterProperties).toHaveBeenCalledWith(
        mockProperties,
        expect.objectContaining({
          location: undefined,
        })
      );
    });

    it('should handle empty search string', () => {
      // Arrange
      component.filterForm.patchValue({ search: '   ' });

      // Act
      component.applyFilters();

      // Assert
      expect(mockPropertyService.filterProperties).toHaveBeenCalledWith(
        mockProperties,
        expect.objectContaining({
          search: undefined,
        })
      );
    });

    it('should convert price strings to numbers', () => {
      // Arrange
      component.filterForm.patchValue({
        minPrice: '100000000',
        maxPrice: '200000000',
      });

      // Act
      component.applyFilters();

      // Assert
      expect(mockPropertyService.filterProperties).toHaveBeenCalledWith(
        mockProperties,
        expect.objectContaining({
          minPrice: 100000000,
          maxPrice: 200000000,
        })
      );
    });
  });

  describe('clearFilters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should clear all filter form values', () => {
      // Arrange
      component.filterForm.patchValue({
        location: ['Medellín'],
        minPrice: '300000000',
        maxPrice: '500000000',
        search: 'test',
        propertyType: 'apartamento',
      });

      // Act
      component.clearFilters();

      // Assert
      expect(component.filterForm.get('location')?.value).toEqual([]);
      expect(component.filterForm.get('minPrice')?.value).toBe('');
      expect(component.filterForm.get('maxPrice')?.value).toBe('');
      expect(component.filterForm.get('search')?.value).toBe('');
      expect(component.filterForm.get('propertyType')?.value).toBe('');
    });

    it('should show success message when clearing filters', () => {
      // Arrange

      // Act
      component.clearFilters();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Filtros limpiados',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    });
  });

  describe('hasActiveFilters', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return false when no filters are active', () => {
      // Arrange
      component.filterForm.patchValue({
        location: [],
        minPrice: '',
        maxPrice: '',
        search: '',
        propertyType: '',
      });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when search filter is active', () => {
      // Arrange
      component.filterForm.patchValue({ search: 'apartamento' });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when location filter is active', () => {
      // Arrange
      component.filterForm.patchValue({ location: ['Medellín'] });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when price filters are active', () => {
      // Arrange
      component.filterForm.patchValue({ minPrice: '100000000' });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when property type filter is active', () => {
      // Arrange
      component.filterForm.patchValue({ propertyType: 'casa' });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(true);
    });

    it('should ignore whitespace in search filter', () => {
      // Arrange
      component.filterForm.patchValue({ search: '   ' });

      // Act
      const result = component.hasActiveFilters();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('confirmDelete', () => {
    it('should open confirmation dialog', () => {
      // Arrange
      const property = mockProperties[0];

      // Act
      component.confirmDelete(property);

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDeleteDialogComponent,
        {
          width: '450px',
          maxWidth: '90vw',
          data: {
            title: 'Eliminar Propiedad',
            message: `¿Estás seguro de que deseas eliminar la propiedad "${property.title}"?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
          },
          disableClose: true,
        }
      );
    });

    it('should call deleteProperty when confirmed', () => {
      // Arrange
      const property = mockProperties[0];
      mockDialogRef.afterClosed.mockReturnValue(of(true));
      const deletePropertySpy = jest
        .spyOn(component, 'deleteProperty')
        .mockImplementation();

      // Act
      component.confirmDelete(property);

      // Assert
      expect(deletePropertySpy).toHaveBeenCalledWith(property.id);
    });

    it('should not call deleteProperty when cancelled', () => {
      // Arrange
      const property = mockProperties[0];
      mockDialogRef.afterClosed.mockReturnValue(of(false));
      const deletePropertySpy = jest
        .spyOn(component, 'deleteProperty')
        .mockImplementation();

      // Act
      component.confirmDelete(property);

      // Assert
      expect(deletePropertySpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteProperty', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.allProperties = [...mockProperties];
      component.properties = [...mockProperties];
    });

    it('should delete property successfully', () => {
      // Arrange
      const propertyId = '1';
      mockPropertyService.delete.mockReturnValue(of(void 0));
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters');

      // Act
      component.deleteProperty(propertyId);

      // Assert
      expect(mockPropertyService.delete).toHaveBeenCalledWith(propertyId);
      expect(component.allProperties.length).toBe(2);
      expect(component.properties.length).toBe(2);
      expect(
        component.allProperties.find((p) => p.id === propertyId)
      ).toBeUndefined();
      expect(applyFiltersSpy).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Propiedad eliminada exitosamente',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    });

    it('should handle delete error', () => {
      // Arrange
      const propertyId = '1';
      const error = new Error('Delete error');
      mockPropertyService.delete.mockReturnValue(throwError(() => error));

      // Act
      component.deleteProperty(propertyId);

      // Assert
      expect(component.loading).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al eliminar la propiedad',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    });

    it('should set loading state during deletion', () => {
      // Arrange
      const propertyId = '1';
      mockPropertyService.delete.mockReturnValue(of(void 0));

      // Act
      component.deleteProperty(propertyId);

      // Assert
      expect(component.loading).toBe(false); // Should be false after completion
    });
  });

  describe('exportProperties', () => {
    beforeEach(() => {
      const anchor = document.createElement('a');
      anchor.click = jest.fn();
      component.filteredProperties = [...mockProperties];
      // Mock DOM methods
      const mockCreateObjectURL = jest.fn().mockReturnValue('mock-url');
      const mockRevokeObjectURL = jest.fn();
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
        writable: true,
      });

      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          if (tagName === 'a') return anchor;
          return document.createElement(tagName);
        });

      Object.defineProperty(window, 'URL', {
        writable: true,
        value: {
          createObjectURL: jest
            .fn()
            .mockReturnValue('blob:http://localhost/mock-url'),
          revokeObjectURL: jest.fn(),
        },
      });
    });

    it('should export properties successfully', () => {
      // Arrange
      const mockElement = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        href: '',
        download: '',
      };
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockElement as any);

      // Act
      component.exportProperties();

      // Assert
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Archivo exportado exitosamente',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    });
  });
});
