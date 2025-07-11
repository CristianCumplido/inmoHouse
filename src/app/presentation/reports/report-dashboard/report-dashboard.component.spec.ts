// reports-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsDashboardComponent } from './report-dashboard.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ExportService } from '../../../application/services/export/export.service';
import { ReportsService } from '../../../application/services/reports/reports.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Opcional pero recomendado para Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
jest.useFakeTimers();
import { MatInputModule } from '@angular/material/input';

describe('ReportsDashboardComponent (Jest)', () => {
  let component: ReportsDashboardComponent;
  let fixture: ComponentFixture<ReportsDashboardComponent>;

  let mockExportService: Partial<ExportService>;
  let mockReportsService: Partial<ReportsService>;
  let mockSnackBar: Partial<MatSnackBar>;

  beforeEach(async () => {
    mockExportService = {
      exportAnalyticsToPDF: jest.fn(),
      exportAnalyticsToExcel: jest.fn(),
    };

    mockReportsService = {}; // Add mock methods if needed in the future

    mockSnackBar = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [ReportsDashboardComponent],
      imports: [
        ReactiveFormsModule,
        MatMenuModule,
        RouterTestingModule,
        MatSelectModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      providers: [
        FormBuilder,
        { provide: ExportService, useValue: mockExportService },
        { provide: ReportsService, useValue: mockReportsService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error when startDate > endDate in applyFilters', () => {
    // Arrange
    component.filterForm.patchValue({
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-01'),
    });

    // Act
    component.applyFilters();

    // Assert
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'La fecha de inicio debe ser anterior a la fecha de fin',
      'Cerrar',
      expect.any(Object)
    );
  });

  it('should show success message when dates are valid in applyFilters', () => {
    // Arrange
    component.filterForm.patchValue({
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
    });

    // Act
    component.applyFilters();

    // Assert
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Filtros aplicados correctamente',
      'Cerrar',
      expect.any(Object)
    );
  });

  it('should export to PDF and show success message', () => {
    // Act
    component.exportToPDF();
    jest.runAllTimers();

    // Assert
    expect(mockExportService.exportAnalyticsToPDF).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Reporte PDF generado correctamente',
      'Cerrar',
      expect.any(Object)
    );
  });

  it('should export to Excel and show success message', () => {
    // Act
    component.exportToExcel();
    jest.runAllTimers();

    // Assert
    expect(mockExportService.exportAnalyticsToExcel).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Reporte Excel generado correctamente',
      'Cerrar',
      expect.any(Object)
    );
  });

  it('should refresh data and show success message', () => {
    // Act
    component.refreshData();
    jest.runAllTimers();

    // Assert
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Datos actualizados correctamente',
      'Cerrar',
      expect.any(Object)
    );
  });
});
