import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyReportsComponent } from './property-reports.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  PropertyReport,
  ReportsService,
} from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';
import { of, Subject, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Property } from 'src/app/core/models/property.model';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

describe('PropertyReportsComponent', () => {
  let component: PropertyReportsComponent;
  let fixture: ComponentFixture<PropertyReportsComponent>;
  let mockReportsService: jest.Mocked<ReportsService>;
  let mockExportService: jest.Mocked<ExportService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockProperties: PropertyReport[] = [
    {
      id: '1',
      title: 'Test Property 1',
      location: 'POBLADO | Bogotá',
      propertyType: 'Apartment',
      price: 100000,
      area: 100,
      pricePerM2: 1000, // 100000 / 100
      daysOnMarket: 15,
      views: 120,
      contacts: 8,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Test Property 2',
      location: 'CIUDAD DEL RÍO | Medellín',
      propertyType: 'House',
      price: 200000,
      area: 200,
      pricePerM2: 1000, // 200000 / 200
      daysOnMarket: 45,
      views: 80,
      contacts: 5,
      status: 'sold',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-16'),
    },
  ];

  beforeEach(async () => {
    mockReportsService = {
      getPropertyReports: jest.fn(),
    } as any;
    mockExportService = {
      exportTableToExcel: jest.fn(),
      exportPropertyReport: jest.fn(),
    } as any;
    mockSnackBar = {
      open: jest.fn(),
    } as any;
    mockDialog = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [PropertyReportsComponent],
      imports: [
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatInputModule,
      ],
      providers: [
        FormBuilder,
        { provide: ReportsService, useValue: mockReportsService },
        { provide: ExportService, useValue: mockExportService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyReportsComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should initialize the component with form and empty data', () => {
      // Arrange
      mockReportsService.getPropertyReports.mockReturnValue(of([]));

      // Act
      fixture.detectChanges(); // Triggers ngOnInit

      // Assert
      expect(component.filtersForm).toBeDefined();
      expect(component.properties).toEqual([]);
      expect(component.filteredProperties).toEqual([]);
      expect(component.summary.totalProperties).toBe(0);
      expect(mockReportsService.getPropertyReports).toHaveBeenCalled();
    });
  });

  describe('loadProperties', () => {
    it('should load properties and update data source', () => {
      // Arrange
      mockReportsService.getPropertyReports.mockReturnValue(of(mockProperties));

      // Act
      component.loadProperties();
      fixture.detectChanges();

      // Assert
      expect(component.properties).toEqual(mockProperties);
      expect(component.filteredProperties).toEqual(mockProperties);
      expect(component.dataSource.data).toEqual(mockProperties);
      expect(component.summary.totalProperties).toBe(2);
      expect(component.summary.activeProperties).toBe(1);
      expect(mockReportsService.getPropertyReports).toHaveBeenCalled();
    });

    it('should handle error when loading properties', () => {
      // Arrange
      const error = new Error('Failed to load');
      mockReportsService.getPropertyReports.mockReturnValue(
        throwError(() => error)
      );

      // Act
      component.loadProperties();
      fixture.detectChanges();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar las propiedades',
        'Cerrar',
        expect.any(Object)
      );
      expect(component.loading).toBeFalsy();
    });
  });

  describe('applyFilters', () => {
    it('should filter properties by status', () => {
      // Arrange
      component.properties = mockProperties;
      component.filtersForm.setValue({
        status: 'active',
        propertyType: '',
        location: '',
        minPrice: '',
        maxPrice: '',
        daysOnMarket: '',
      });

      // Act
      component.applyFilters();

      // Assert
      expect(component.filteredProperties.length).toBe(1);
      expect(component.filteredProperties[0].status).toBe('active');
      expect(component.dataSource.data).toEqual([mockProperties[0]]);
    });

    it('should filter properties by price range', () => {
      // Arrange
      component.properties = mockProperties;
      component.filtersForm.setValue({
        status: '',
        propertyType: '',
        location: '',
        minPrice: 150000,
        maxPrice: 250000,
        daysOnMarket: '',
      });

      // Act
      component.applyFilters();

      // Assert
      expect(component.filteredProperties.length).toBe(1);
      expect(component.filteredProperties[0].price).toBe(200000);
    });
  });

  describe('calculateSummary', () => {
    it('should calculate correct summary statistics', () => {
      // Arrange
      component.filteredProperties = mockProperties;

      // Act
      component.calculateSummary();

      // Assert
      expect(component.summary.totalProperties).toBe(2);
      expect(component.summary.activeProperties).toBe(1);
      expect(component.summary.avgPrice).toBe(150000);
      expect(component.summary.avgDaysOnMarket).toBe(30);
    });
  });

  describe('getConversionRate', () => {
    it('should calculate correct conversion rate', () => {
      // Arrange
      const property = mockProperties[0];

      // Act
      const rate = component.getConversionRate(property);

      // Assert
      expect(rate).toBe(6.7); // 10 contacts / 200 views * 100
    });

    it('should return 0 when views are 0', () => {
      // Arrange
      const property = { ...mockProperties[0], views: 0 };

      // Act
      const rate = component.getConversionRate(property);

      // Assert
      expect(rate).toBe(0);
    });
  });

  describe('exportToExcel', () => {
    it('should call export service with correct parameters', () => {
      // Arrange
      component.filteredProperties = mockProperties;

      // Act
      component.exportToExcel();

      // Assert
      expect(mockExportService.exportTableToExcel).toHaveBeenCalledWith(
        mockProperties,
        'reporte-propiedades',
        'Propiedades'
      );
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Reporte exportado exitosamente',
        'Cerrar',
        expect.any(Object)
      );
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
