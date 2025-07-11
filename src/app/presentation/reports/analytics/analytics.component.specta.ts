import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { AnalyticsComponent } from './analytics.component';
import { ReportsService } from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }],
    },
  })),
  registerables: [],
}));

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let mockReportsService: jest.Mocked<ReportsService>;
  let mockExportService: jest.Mocked<ExportService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  const mockAnalyticsData = {
    analytics: {
      totalProperties: 1247,
      totalUsers: 3856,
      totalRevenue: 15750000000,
      avgPrice: 450000000,
      propertiesGrowth: 12.5,
      usersGrowth: 8.3,
      revenueGrowth: 15.7,
      priceChange: 3.2,
      avgDaysOnMarket: 45,
      conversionRate: 2.8,
      mostPopularLocation: 'Medellín',
      avgPricePerM2: 3200000,
    },
  };

  beforeEach(async () => {
    // Arrange - Mock services
    mockReportsService = {
      getAnalyticsData: jest.fn(),
    } as any;

    mockExportService = {
      exportChart: jest.fn(),
    } as any;

    mockSnackBar = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [AnalyticsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ReportsService, useValue: mockReportsService },
        { provide: ExportService, useValue: mockExportService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create component successfully', () => {
      // Arrange & Act
      // Component creation happens in beforeEach

      // Assert
      expect(component).toBeTruthy();
    });

    it('should initialize form with correct default values', () => {
      // Arrange
      const expectedEndDate = new Date();
      const expectedStartDate = new Date();
      expectedStartDate.setMonth(expectedStartDate.getMonth() - 1);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.filterForm).toBeDefined();
      expect(component.filterForm.get('period')?.value).toBe('month');
      expect(component.filterForm.get('priceViewMode')?.value).toBe('line');
      expect(component.filterForm.get('startDate')?.value).toBeInstanceOf(Date);
      expect(component.filterForm.get('endDate')?.value).toBeInstanceOf(Date);
    });

    it('should initialize analytics data with default values', () => {
      // Arrange & Act
      // Default values are set in component initialization

      // Assert
      expect(component.analytics.totalProperties).toBe(0);
      expect(component.analytics.totalUsers).toBe(0);
      expect(component.analytics.totalRevenue).toBe(0);
      expect(component.analytics.avgPrice).toBe(0);
      expect(component.propertiesTypeData).toEqual([]);
      expect(component.topPropertiesData).toEqual([]);
      expect(component.recentActivities).toEqual([]);
    });
  });

  describe('Data Loading', () => {
    it('should load analytics data successfully', async () => {
      // Arrange
      mockReportsService.getAnalyticsData.mockReturnValue(
        of(mockAnalyticsData)
      );

      // Act
      component.loadAnalyticsData();

      // Assert
      expect(mockReportsService.getAnalyticsData).toHaveBeenCalled();
      expect(component.analytics).toEqual(mockAnalyticsData.analytics);
      expect(component.propertiesTypeData).toEqual(
        mockAnalyticsData.propertiesTypeData
      );
      expect(component.topPropertiesData).toEqual(
        mockAnalyticsData.topProperties
      );
      expect(component.recentActivities).toEqual(
        mockAnalyticsData.recentActivities
      );
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading analytics data and load mock data', async () => {
      // Arrange
      const errorResponse = new Error('Service error');
      mockReportsService.getAnalyticsData.mockReturnValue(
        throwError(() => errorResponse)
      );

      // Act
      component.loadAnalyticsData();

      // Assert
      expect(mockReportsService.getAnalyticsData).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar los datos analíticos',
        'Cerrar',
        expect.objectContaining({
          duration: 5000,
          panelClass: ['error-snackbar'],
        })
      );
      expect(component.loading).toBe(false);
      expect(component.analytics.totalProperties).toBe(1247); // Mock data
    });

    it('should set loading state correctly during data loading', () => {
      // Arrange
      mockReportsService.getAnalyticsData.mockReturnValue(
        of(mockAnalyticsData)
      );

      // Act
      component.loadAnalyticsData();

      // Assert
      expect(component.loading).toBe(false);
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should update date range when period changes to week', () => {
      // Arrange
      const expectedStartDate = new Date();
      expectedStartDate.setDate(expectedStartDate.getDate() - 7);

      // Act
      component.filterForm.patchValue({ period: 'week' });

      // Assert
      const startDate = component.filterForm.get('startDate')?.value;
      expect(startDate.getDate()).toBe(expectedStartDate.getDate());
    });

    it('should update date range when period changes to quarter', () => {
      // Arrange
      const expectedStartDate = new Date();
      expectedStartDate.setMonth(expectedStartDate.getMonth() - 3);

      // Act
      component.filterForm.patchValue({ period: 'quarter' });

      // Assert
      const startDate = component.filterForm.get('startDate')?.value;
      expect(startDate.getMonth()).toBe(expectedStartDate.getMonth());
    });

    it('should update date range when period changes to year', () => {
      // Arrange
      const expectedStartDate = new Date();
      expectedStartDate.setFullYear(expectedStartDate.getFullYear() - 1);

      // Act
      component.filterForm.patchValue({ period: 'year' });

      // Assert
      const startDate = component.filterForm.get('startDate')?.value;
      expect(startDate.getFullYear()).toBe(expectedStartDate.getFullYear());
    });

    it('should not update date range when period is custom', () => {
      // Arrange
      const originalStartDate = component.filterForm.get('startDate')?.value;

      // Act
      component.filterForm.patchValue({ period: 'custom' });

      // Assert
      const startDate = component.filterForm.get('startDate')?.value;
      expect(startDate).toEqual(originalStartDate);
    });
  });

  describe('Chart Management', () => {
    it('should destroy all charts on component destroy', () => {
      // Arrange
      const mockChart = {
        destroy: jest.fn(),
        update: jest.fn(),
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      };
      component['charts'] = { testChart: mockChart as any };

      // Act
      component.ngOnDestroy();

      // Assert
      expect(mockChart.destroy).toHaveBeenCalled();
      expect(component['charts']).toEqual({});
    });

    it('should update charts when data changes', () => {
      // Arrange
      const mockChart = {
        destroy: jest.fn(),
        update: jest.fn(),
        data: {
          labels: [],
          datasets: [{ data: [], backgroundColor: [] }],
        },
      };
      component['charts'] = { propertiesByType: mockChart as any };
      component.propertiesTypeData = [
        { label: 'Test', value: 100, color: '#000' },
      ];

      // Act
      component['updateCharts']();

      // Assert
      expect(mockChart.update).toHaveBeenCalled();
      expect(mockChart.data.labels).toEqual(['Test']);
      expect(mockChart.data.datasets[0].data).toEqual([100]);
      expect(mockChart.data.datasets[0].backgroundColor).toEqual(['#000']);
    });
  });

  describe('User Actions', () => {
    it('should apply filters and show success message', () => {
      // Arrange
      mockReportsService.getAnalyticsData.mockReturnValue(
        of(mockAnalyticsData)
      );

      // Act
      component.applyFilters();

      // Assert
      expect(mockReportsService.getAnalyticsData).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Filtros aplicados correctamente',
        'Cerrar',
        expect.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar'],
        })
      );
    });

    it('should refresh data and show success message', () => {
      // Arrange
      mockReportsService.getAnalyticsData.mockReturnValue(
        of(mockAnalyticsData)
      );

      // Act
      component.refreshData();

      // Assert
      expect(mockReportsService.getAnalyticsData).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Datos actualizados',
        'Cerrar',
        expect.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar'],
        })
      );
    });

    it('should export chart and show success message', () => {
      // Arrange
      const chartName = 'testChart';
      const mockChart = { destroy: jest.fn() };
      component['charts'] = { [chartName]: mockChart as any };

      // Act
      component.exportChart(chartName);

      // Assert
      expect(mockExportService.exportChart).toHaveBeenCalledWith(
        chartName,
        mockChart
      );
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Gráfico exportado correctamente',
        'Cerrar',
        expect.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar'],
        })
      );
    });
  });

  describe('Utility Methods', () => {
    it('should return correct activity icon for different types', () => {
      // Arrange & Act & Assert
      expect(component.getActivityIcon('create')).toBe('add_circle');
      expect(component.getActivityIcon('update')).toBe('edit');
      expect(component.getActivityIcon('delete')).toBe('delete');
      expect(component.getActivityIcon('view')).toBe('visibility');
      expect(component.getActivityIcon('contact')).toBe('contact_phone');
      expect(component.getActivityIcon('unknown')).toBe('info');
    });

    it('should return correct activity icon class for different types', () => {
      // Arrange & Act & Assert
      expect(component.getActivityIconClass('create')).toBe('success');
      expect(component.getActivityIconClass('update')).toBe('warning');
      expect(component.getActivityIconClass('delete')).toBe('error');
      expect(component.getActivityIconClass('view')).toBe('');
      expect(component.getActivityIconClass('contact')).toBe('success');
      expect(component.getActivityIconClass('unknown')).toBe('');
    });
  });

  describe('Component Lifecycle', () => {
    it('should call loadAnalyticsData on ngOnInit', () => {
      // Arrange
      const loadAnalyticsDataSpy = jest.spyOn(component, 'loadAnalyticsData');
      mockReportsService.getAnalyticsData.mockReturnValue(
        of(mockAnalyticsData)
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(loadAnalyticsDataSpy).toHaveBeenCalled();
    });

    it('should complete destroy subject on ngOnDestroy', () => {
      // Arrange
      const destroySpy = jest.spyOn(component['destroy$'], 'complete');
      const nextSpy = jest.spyOn(component['destroy$'], 'next');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(nextSpy).toHaveBeenCalled();
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should initialize charts after view init with timeout', (done) => {
      // Arrange
      const initializeChartsSpy = jest.spyOn(
        component as any,
        'initializeCharts'
      );

      // Act
      component.ngAfterViewInit();

      // Assert
      setTimeout(() => {
        expect(initializeChartsSpy).toHaveBeenCalled();
        done();
      }, 150);
    });
  });

  describe('Error Handling', () => {
    it('should show error message with correct parameters', () => {
      // Arrange
      const errorMessage = 'Test error message';

      // Act
      component['showErrorMessage'](errorMessage);

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        errorMessage,
        'Cerrar',
        expect.objectContaining({
          duration: 5000,
          panelClass: ['error-snackbar'],
        })
      );
    });

    it('should show success message with correct parameters', () => {
      // Arrange
      const successMessage = 'Test success message';

      // Act
      component['showSuccessMessage'](successMessage);

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        successMessage,
        'Cerrar',
        expect.objectContaining({
          duration: 3000,
          panelClass: ['success-snackbar'],
        })
      );
    });
  });

  describe('Price Trend Chart Updates', () => {
    it('should update price trend chart when view mode changes', () => {
      // Arrange
      component.ngOnInit();
      const mockChart = {
        destroy: jest.fn(),
        update: jest.fn(),
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      };
      component['charts'] = { priceTrends: mockChart as any };

      // Act
      component.filterForm.patchValue({ priceViewMode: 'bar' });

      // Assert
      expect(mockChart.destroy).toHaveBeenCalled();
    });
  });

  describe('Mock Data Loading', () => {
    it('should load mock data correctly', () => {
      // Arrange & Act
      component['loadMockData']();

      // Assert
      expect(component.analytics.totalProperties).toBe(1247);
      expect(component.analytics.totalUsers).toBe(3856);
      expect(component.analytics.mostPopularLocation).toBe('Medellín');
      expect(component.propertiesTypeData).toHaveLength(4);
      expect(component.topPropertiesData).toHaveLength(5);
      expect(component.recentActivities).toHaveLength(5);
    });
  });
});
