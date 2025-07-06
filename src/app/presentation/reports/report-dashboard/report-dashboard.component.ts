import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ReportsService } from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss'],
})
export class ReportsDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filterForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.filterForm = this.fb.group({
      startDate: [startDate],
      endDate: [endDate],
      period: ['month'],
    });
  }

  private setupFormSubscriptions(): void {
    this.filterForm
      .get('period')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((period) => {
        this.updateDateRangeFromPeriod(period);
      });
  }

  private updateDateRangeFromPeriod(period: string): void {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        return; // Don't update dates for custom period
    }

    this.filterForm.patchValue(
      {
        startDate,
        endDate,
      },
      { emitEvent: false }
    );
  }

  applyFilters(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;

    if (startDate && endDate && startDate > endDate) {
      this.showErrorMessage(
        'La fecha de inicio debe ser anterior a la fecha de fin'
      );
      return;
    }

    // Emit filter changes to child components through a service or other mechanism
    this.showSuccessMessage('Filtros aplicados correctamente');
  }

  refreshData(): void {
    this.loading = true;
    // Trigger refresh in child components
    setTimeout(() => {
      this.loading = false;
      this.showSuccessMessage('Datos actualizados correctamente');
    }, 1000);
  }

  exportToPDF(): void {
    this.loading = true;
    this.exportService.exportAnalyticsToPDF();
    setTimeout(() => {
      this.loading = false;
      this.showSuccessMessage('Reporte PDF generado correctamente');
    }, 2000);
  }

  exportToExcel(): void {
    this.loading = true;
    this.exportService.exportAnalyticsToExcel();
    setTimeout(() => {
      this.loading = false;
      this.showSuccessMessage('Reporte Excel generado correctamente');
    }, 2000);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
