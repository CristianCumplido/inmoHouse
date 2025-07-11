import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { ReportsService } from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteDialogData,
} from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';
declare var Chart: any;

interface PropertySummary {
  totalProperties: number;
  activeProperties: number;
  avgPrice: number;
  avgDaysOnMarket: number;
}

@Component({
  selector: 'app-property-reports',
  templateUrl: './property-reports.component.html',
  styleUrls: ['./property-reports.component.scss'],
})
export class PropertyReportsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('performanceChart', { static: false })
  performanceChart!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();

  properties: any[] = [];
  filteredProperties: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedProperty: any | null = null;

  filtersForm!: FormGroup;

  loading = false;

  summary: PropertySummary = {
    totalProperties: 0,
    activeProperties: 0,
    avgPrice: 0,
    avgDaysOnMarket: 0,
  };

  displayedColumns: string[] = [
    'title',
    'propertyType',
    'price',
    'area',
    'views',
    'contacts',
    'daysOnMarket',
    'status',
    'actions',
  ];

  locations: string[] = [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales',
    'Ibagué',
    'Villavicencio',
  ];

  private chart: any;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProperties();
    this.setupFormSubscriptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.title.toLowerCase().includes(filter) ||
        data.location.toLowerCase().includes(filter) ||
        data.propertyType.toLowerCase().includes(filter)
      );
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyChart();
  }

  private initializeForm(): void {
    this.filtersForm = this.fb.group({
      status: [''],
      propertyType: [''],
      location: [''],
      minPrice: [''],
      maxPrice: [''],
      daysOnMarket: [''],
    });
  }

  private setupFormSubscriptions(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  loadProperties(): void {
    this.loading = true;

    this.reportsService
      .getPropertyReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.properties = properties;
          this.applyFilters();
          this.calculateSummary();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.showErrorMessage('Error al cargar las propiedades');
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    const filters = this.filtersForm.value;

    this.filteredProperties = this.properties.filter((property) => {
      if (filters.status && property.status !== filters.status) {
        return false;
      }

      if (
        filters.propertyType &&
        property.propertyType !== filters.propertyType
      ) {
        return false;
      }

      if (filters.location && property.location !== filters.location) {
        return false;
      }

      if (filters.minPrice && property.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && property.price > filters.maxPrice) {
        return false;
      }

      if (filters.daysOnMarket) {
        const days = property.daysOnMarket;
        switch (filters.daysOnMarket) {
          case '0-30':
            return days <= 30;
          case '31-60':
            return days >= 31 && days <= 60;
          case '61-90':
            return days >= 61 && days <= 90;
          case '90+':
            return days > 90;
        }
      }

      return true;
    });

    this.dataSource.data = this.filteredProperties;
    this.calculateSummary();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.applyFilters();
    this.showSuccessMessage('Filtros limpiados');
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  calculateSummary(): void {
    const total = this.filteredProperties.length;
    const active = this.filteredProperties.filter(
      (p) => p.status === 'active'
    ).length;
    const avgPrice =
      total > 0
        ? this.filteredProperties.reduce((sum, p) => sum + p.price, 0) / total
        : 0;
    const avgDays =
      total > 0
        ? this.filteredProperties.reduce((sum, p) => sum + p.daysOnMarket, 0) /
          total
        : 0;

    this.summary = {
      totalProperties: total,
      activeProperties: active,
      avgPrice: avgPrice,
      avgDaysOnMarket: Math.round(avgDays),
    };
  }

  selectProperty(property: any): void {
    this.selectedProperty = property;
    setTimeout(() => {
      this.createPerformanceChart();
    }, 100);
  }

  viewPerformance(property: any): void {
    this.selectProperty(property);
  }

  closePerformanceChart(): void {
    this.selectedProperty = null;
    this.destroyChart();
  }

  private createPerformanceChart(): void {
    if (!this.performanceChart?.nativeElement || !this.selectedProperty) return;

    this.destroyChart();

    const ctx = this.performanceChart.nativeElement.getContext('2d');

    const mockData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      views: [45, 52, 38, 67, 73, 89],
      contacts: [2, 3, 1, 4, 5, 7],
    };

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mockData.labels,
        datasets: [
          {
            label: 'Vistas',
            data: mockData.views,
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Contactos',
            data: mockData.contacts,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Rendimiento Mensual',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  getDaysClass(days: number): string {
    if (days <= 30) return 'days-good';
    if (days <= 60) return 'days-warning';
    return 'days-danger';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Activa',
      sold: 'Vendida',
      rented: 'Alquilada',
      inactive: 'Inactiva',
    };
    return labels[status] || status;
  }

  isHighPerformance(property: any): boolean {
    return property.views > 200 && property.contacts > 10;
  }

  getConversionRate(property: any): number {
    if (property.views === 0) return 0;
    return Number(((property.contacts / property.views) * 100).toFixed(1));
  }

  refreshData(): void {
    this.loadProperties();
    this.showSuccessMessage('Datos actualizados');
  }

  exportToExcel(): void {
    this.exportService.exportTableToExcel(
      this.filteredProperties,
      'reporte-propiedades',
      'Propiedades'
    );
    this.showSuccessMessage('Reporte exportado exitosamente');
  }

  exportProperty(property: any): void {
    this.exportService.exportPropertyReport(property.id, 'excel');
    this.showSuccessMessage(`Reporte de ${property.title} exportado`);
  }

  duplicateProperty(property: any): void {
    this.showInfoMessage('Funcionalidad de duplicado en desarrollo');
  }

  deleteProperty(property: any): void {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Eliminar Propiedad',
      message: `¿Estás seguro de que deseas eliminar la propiedad "${property.title}"?`,

      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.properties = this.properties.filter((p) => p.id !== property.id);
        this.applyFilters();
        this.showSuccessMessage(
          `Propiedad "${property.title}" eliminada exitosamente`
        );
      }
    });
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

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
