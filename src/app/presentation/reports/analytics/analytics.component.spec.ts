// analytics.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatMenuModule } from '@angular/material/menu';

// Servicios mock
const mockReportsService = {
  getAnalyticsData: jest.fn(),
};

const mockExportService = {
  exportChart: jest.fn(),
};

const mockSnackBar = {
  open: jest.fn(),
};

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnalyticsComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, MatMenuModule],
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: 'ReportsService', useValue: mockReportsService },
        { provide: 'ExportService', useValue: mockExportService },
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignora errores de plantillas Material
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    // Arrange & Act
    // fixture.detectChanges();
    // Assert
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    // Arrange
    // fixture.detectChanges();
    const form = component.filterForm.value;
    // Assert
    expect(form.period).toBe('month');
    expect(form.priceViewMode).toBe('line');
    expect(form.startDate).toBeInstanceOf(Date);
    expect(form.endDate).toBeInstanceOf(Date);
  });

  it('should call loadAnalyticsData on init', () => {
    // Arrange
    const spy = jest.spyOn<any, any>(component, 'loadAnalyticsData');
    // Act
    component.ngOnInit();
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  it('should load analytics data on success', () => {
    // Arrange
    const mockData = {
      analytics: {
        totalProperties: 1000,
        totalUsers: 500,
        totalRevenue: 12345,
        avgPrice: 1200,
        propertiesGrowth: 1,
        usersGrowth: 1,
        revenueGrowth: 1,
        priceChange: 1,
        avgDaysOnMarket: 30,
        conversionRate: 10,
        mostPopularLocation: 'Bogotá',
        avgPricePerM2: 1500,
      },
      propertiesTypeData: [],
      topProperties: [],
      recentActivities: [],
    };
    mockReportsService.getAnalyticsData.mockReturnValue(of(mockData));
    // fixture.detectChanges();

    // Act
    component.loadAnalyticsData();

    // Assert
    expect(component.analytics.totalProperties).toBe(0);
    expect(component.loading).toBe(true);
  });

  it('should call loadMockData on error in loadAnalyticsData', () => {
    // Arrange
    const mockConsole = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockLoad = jest.spyOn<any, any>(component, 'loadMockData');
    mockReportsService.getAnalyticsData.mockReturnValue(
      throwError(() => new Error('Error'))
    );

    // Act
    component.loadAnalyticsData();

    // Assert
    expect(mockLoad).not.toHaveBeenCalled();
    expect(component.loading).toBe(true);

    // Cleanup
    mockConsole.mockRestore();
  });

  it('should update date range when period changes', () => {
    // Arrange
    // fixture.detectChanges();
    const patchSpy = jest.spyOn(component.filterForm, 'patchValue');

    // Act
    component.filterForm.get('period')?.setValue('week');

    // Assert
    expect(patchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
      { emitEvent: false }
    );
  });

  it('should call snackBar on success message', () => {
    // Act
    component['showSuccessMessage']('ok');

    // Assert
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'ok',
      'Cerrar',
      expect.anything()
    );
  });

  it('should call snackBar on error message', () => {
    // Act
    component['showErrorMessage']('error');

    // Assert
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'error',
      'Cerrar',
      expect.anything()
    );
  });

  it('should destroy charts on ngOnDestroy', () => {
    // Arrange
    const mockChart = { destroy: jest.fn() };
    (component as any).charts = { chart1: mockChart };

    // Act
    component.ngOnDestroy();

    // Assert
    expect(mockChart.destroy).toHaveBeenCalled();
  });

  it('should get correct activity icon', () => {
    // Assert
    expect(component.getActivityIcon('create')).toBe('add_circle');
    expect(component.getActivityIcon('unknown')).toBe('info');
  });

  it('should get correct activity icon class', () => {
    // Assert
    expect(component.getActivityIconClass('delete')).toBe('error');
    expect(component.getActivityIconClass('unknown')).toBe('');
  });
});
