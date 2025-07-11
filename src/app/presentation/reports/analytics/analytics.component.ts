import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ReportsService } from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';

// Importación correcta de Chart.js
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartType,
  ChartData,
} from 'chart.js';

interface AnalyticsData {
  totalProperties: number;
  totalUsers: number;
  totalRevenue: number;
  avgPrice: number;
  propertiesGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
  priceChange: number;
  avgDaysOnMarket: number;
  conversionRate: number;
  mostPopularLocation: string;
  avgPricePerM2: number;
}

interface PropertyTypeData {
  label: string;
  value: number;
  color: string;
}

interface TopProperty {
  id: string;
  title: string;
  location: string;
  views: number;
  viewsTrend: number;
  price: number;
}

interface Activity {
  type: 'create' | 'update' | 'delete' | 'view' | 'contact';
  description: string;
  timestamp: Date;
  actionable: boolean;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('propertiesByTypeChart', { static: false })
  propertiesByTypeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('propertiesByLocationChart', { static: false })
  propertiesByLocationChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priceTrendsChart', { static: false })
  priceTrendsChart!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();

  // Form
  filterForm!: FormGroup;

  // Data
  analytics: AnalyticsData = {
    totalProperties: 0,
    totalUsers: 0,
    totalRevenue: 0,
    avgPrice: 0,
    propertiesGrowth: 0,
    usersGrowth: 0,
    revenueGrowth: 0,
    priceChange: 0,
    avgDaysOnMarket: 0,
    conversionRate: 0,
    mostPopularLocation: '',
    avgPricePerM2: 0,
  };

  propertiesTypeData: PropertyTypeData[] = [];
  topPropertiesData: TopProperty[] = [];
  recentActivities: Activity[] = [];

  // Table columns
  topPropertiesColumns: string[] = ['title', 'views', 'price', 'actions'];

  // Charts
  private charts: { [key: string]: Chart } = {};

  // State
  loading = false;

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {
    // Registrar todos los componentes de Chart.js
    Chart.register(...registerables);
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.setupFormSubscriptions();
  }

  ngAfterViewInit(): void {
    // Delay chart initialization to ensure DOM is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private initializeForm(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.filterForm = this.fb.group({
      startDate: [startDate],
      endDate: [endDate],
      period: ['month'],
      priceViewMode: ['line'],
    });
  }

  private setupFormSubscriptions(): void {
    this.filterForm
      .get('period')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((period) => {
        this.updateDateRangeFromPeriod(period);
      });

    this.filterForm
      .get('priceViewMode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updatePriceTrendChart();
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

  loadAnalyticsData(): void {
    this.loading = true;

    this.reportsService
      .getAnalyticsData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.analytics = data.analytics;
          this.propertiesTypeData = data.propertiesTypeData;
          this.topPropertiesData = data.topProperties;
          this.recentActivities = data.recentActivities;

          if (this.propertiesByTypeChart) {
            this.updateCharts();
          }

          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading analytics:', error);
          this.showErrorMessage('Error al cargar los datos analíticos');
          this.loading = false;

          // Load mock data on error
          this.loadMockData();
        },
      });
  }

  private loadMockData(): void {
    // Mock data for demonstration
    this.analytics = {
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
    };

    this.propertiesTypeData = [
      { label: 'Apartamentos', value: 45, color: '#1976d2' },
      { label: 'Casas', value: 30, color: '#388e3c' },
      { label: 'Locales', value: 15, color: '#f57c00' },
      { label: 'Oficinas', value: 10, color: '#7b1fa2' },
    ];

    this.topPropertiesData = [
      {
        id: '1',
        title: 'Penthouse Zona Rosa',
        location: 'Bogotá',
        views: 1250,
        viewsTrend: 15,
        price: 850000000,
      },
      {
        id: '2',
        title: 'Casa Campestre',
        location: 'Medellín',
        views: 980,
        viewsTrend: 8,
        price: 650000000,
      },
      {
        id: '3',
        title: 'Apartamento Centro',
        location: 'Cali',
        views: 875,
        viewsTrend: 12,
        price: 320000000,
      },
      {
        id: '4',
        title: 'Local Comercial',
        location: 'Barranquilla',
        views: 720,
        viewsTrend: 5,
        price: 280000000,
      },
      {
        id: '5',
        title: 'Oficina Moderna',
        location: 'Cartagena',
        views: 650,
        viewsTrend: 20,
        price: 420000000,
      },
    ];

    this.recentActivities = [
      {
        type: 'create',
        description: 'Nueva propiedad agregada: "Apartamento Moderno"',
        timestamp: new Date(),
        actionable: true,
      },
      {
        type: 'contact',
        description: 'Contacto recibido para Casa en Envigado',
        timestamp: new Date(Date.now() - 3600000),
        actionable: true,
      },
      {
        type: 'update',
        description: 'Precio actualizado para Penthouse Centro',
        timestamp: new Date(Date.now() - 7200000),
        actionable: false,
      },
      {
        type: 'view',
        description: '50 nuevas vistas en propiedades de Medellín',
        timestamp: new Date(Date.now() - 10800000),
        actionable: false,
      },
      {
        type: 'create',
        description: 'Nuevo usuario registrado: Juan Pérez',
        timestamp: new Date(Date.now() - 14400000),
        actionable: false,
      },
    ];

    this.updateCharts();
  }

  private initializeCharts(): void {
    this.createPropertiesByTypeChart();
    this.createPropertiesByLocationChart();
    this.createPriceTrendsChart();
  }

  private createPropertiesByTypeChart(): void {
    if (!this.propertiesByTypeChart?.nativeElement) return;

    const ctx = this.propertiesByTypeChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['propertiesByType'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.propertiesTypeData.map((item) => item.label),
        datasets: [
          {
            data: this.propertiesTypeData.map((item) => item.value),
            backgroundColor: this.propertiesTypeData.map((item) => item.color),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  private createPropertiesByLocationChart(): void {
    if (!this.propertiesByLocationChart?.nativeElement) return;

    const ctx = this.propertiesByLocationChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const locationData = [
      { label: 'Bogotá', value: 420 },
      { label: 'Medellín', value: 350 },
      { label: 'Cali', value: 180 },
      { label: 'Barranquilla', value: 120 },
      { label: 'Cartagena', value: 90 },
      { label: 'Otros', value: 87 },
    ];

    this.charts['propertiesByLocation'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: locationData.map((item) => item.label),
        datasets: [
          {
            label: 'Propiedades',
            data: locationData.map((item) => item.value),
            backgroundColor: '#1976d2',
            borderColor: '#1565c0',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  private createPriceTrendsChart(chartType: ChartType = 'line'): void {
    if (!this.priceTrendsChart?.nativeElement) return;

    const ctx = this.priceTrendsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const monthlyData = [
      { month: 'Ene', avgPrice: 420000000 },
      { month: 'Feb', avgPrice: 435000000 },
      { month: 'Mar', avgPrice: 445000000 },
      { month: 'Abr', avgPrice: 440000000 },
      { month: 'May', avgPrice: 450000000 },
      { month: 'Jun', avgPrice: 465000000 },
    ];

    // Configuración específica según el tipo de gráfico
    const isBarChart = chartType === 'bar';

    this.charts['priceTrends'] = new Chart(ctx, {
      type: chartType,
      data: {
        labels: monthlyData.map((item) => item.month),
        datasets: [
          {
            label: 'Precio Promedio',
            data: monthlyData.map((item) => item.avgPrice),
            borderColor: '#1976d2',
            backgroundColor: isBarChart ? '#1976d2' : 'rgba(25, 118, 210, 0.1)',
            fill: !isBarChart,
            tension: isBarChart ? undefined : 0.4,
            pointBackgroundColor: isBarChart ? undefined : '#1976d2',
            pointBorderColor: isBarChart ? undefined : '#ffffff',
            pointBorderWidth: isBarChart ? undefined : 2,
            pointRadius: isBarChart ? undefined : 5,
            borderWidth: isBarChart ? 1 : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value: any) {
                return new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              },
            },
          },
        },
      },
    });
  }

  private updateCharts(): void {
    if (this.charts['propertiesByType']) {
      this.charts['propertiesByType'].data.labels = this.propertiesTypeData.map(
        (item) => item.label
      );
      this.charts['propertiesByType'].data.datasets[0].data =
        this.propertiesTypeData.map((item) => item.value);
      this.charts['propertiesByType'].data.datasets[0].backgroundColor =
        this.propertiesTypeData.map((item) => item.color);
      this.charts['propertiesByType'].update();
    }
  }

  private updatePriceTrendChart(): void {
    const viewMode = this.filterForm.get('priceViewMode')?.value;

    if (this.charts['priceTrends']) {
      // Destruir el gráfico existente
      this.charts['priceTrends'].destroy();
      delete this.charts['priceTrends'];

      // Crear el nuevo gráfico con el tipo actualizado
      this.createPriceTrendsChart(viewMode as ChartType);
    }
  }

  private destroyCharts(): void {
    Object.values(this.charts).forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  // Public methods
  applyFilters(): void {
    this.loadAnalyticsData();
    this.showSuccessMessage('Filtros aplicados correctamente');
  }

  refreshData(): void {
    this.loadAnalyticsData();
    this.showSuccessMessage('Datos actualizados');
  }

  exportChart(chartName: string): void {
    this.exportService.exportChart(chartName, this.charts[chartName]);
    this.showSuccessMessage('Gráfico exportado correctamente');
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      create: 'add_circle',
      update: 'edit',
      delete: 'delete',
      view: 'visibility',
      contact: 'contact_phone',
    };
    return icons[type] || 'info';
  }

  getActivityIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      create: 'success',
      update: 'warning',
      delete: 'error',
      view: '',
      contact: 'success',
    };
    return classes[type] || '';
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
