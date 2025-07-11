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

import { Chart, registerables, ChartConfiguration, ChartType } from 'chart.js';

interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  avgPropertiesViewed: number;
}

interface UserRoleData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.scss'],
})
export class UserReportsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('registrationChart', { static: false })
  registrationChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('roleChart', { static: false })
  roleChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart', { static: false })
  activityChart!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();

  users: any[] = [];
  filteredUsers: any[] = [];
  dataSource = new MatTableDataSource<any>();
  selectedUser: any | null = null;

  filtersForm!: FormGroup;

  loading = false;

  summary: UserSummary = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    avgPropertiesViewed: 0,
  };

  userRoleData: UserRoleData[] = [];

  displayedColumns: string[] = [
    'name',
    'role',
    'registrationDate',
    'lastLogin',
    'propertiesViewed',
    'contactsMade',
    'engagementRate',
    'status',
    'actions',
  ];

  private charts: { [key: string]: Chart } = {};

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    Chart.register(...registerables);
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupFormSubscriptions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.name.toLowerCase().includes(filter) ||
        data.email.toLowerCase().includes(filter) ||
        data.role.toLowerCase().includes(filter)
      );
    };

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
    this.filtersForm = this.fb.group({
      role: [''],
      status: [''],
      registrationPeriod: [''],
      activityLevel: [''],
    });
  }

  private setupFormSubscriptions(): void {
    this.filtersForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});
  }

  private loadUsers(): void {
    this.loading = true;

    this.reportsService
      .getUserReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilters();
          this.calculateSummary();
          this.calculateRoleData();
          this.updateCharts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.showErrorMessage('Error al cargar los usuarios');
          this.loading = false;
          this.loadMockUsers();
        },
      });
  }

  private loadMockUsers(): void {
    this.users = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan@email.com',
        role: 'buyer',
        registrationDate: new Date('2024-01-15'),
        lastLogin: new Date('2024-07-04'),
        propertiesViewed: 15,
        contactsMade: 3,
        status: 'active',
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria@email.com',
        role: 'seller',
        registrationDate: new Date('2024-02-20'),
        lastLogin: new Date('2024-07-03'),
        propertiesViewed: 8,
        contactsMade: 5,
        status: 'active',
      },
      {
        id: 3,
        name: 'Carlos López',
        email: 'carlos@email.com',
        role: 'agent',
        registrationDate: new Date('2024-03-10'),
        lastLogin: new Date('2024-06-30'),
        propertiesViewed: 25,
        contactsMade: 12,
        status: 'inactive',
      },
    ];

    this.applyFilters();
    this.calculateSummary();
    this.calculateRoleData();
    this.updateCharts();
    this.loading = false;
  }

  applyFilters(): void {
    const filters = this.filtersForm.value;

    this.filteredUsers = this.users.filter((user) => {
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      if (filters.status && user.status !== filters.status) {
        return false;
      }

      if (filters.registrationPeriod) {
        const now = new Date();
        const registrationDate = new Date(user.registrationDate);
        const daysDiff = Math.floor(
          (now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.registrationPeriod) {
          case 'last-week':
            if (daysDiff > 7) return false;
            break;
          case 'last-month':
            if (daysDiff > 30) return false;
            break;
          case 'last-quarter':
            if (daysDiff > 90) return false;
            break;
          case 'last-year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      if (filters.activityLevel) {
        const views = user.propertiesViewed;
        switch (filters.activityLevel) {
          case 'high':
            if (views < 10) return false;
            break;
          case 'medium':
            if (views < 3 || views > 9) return false;
            break;
          case 'low':
            if (views < 1 || views > 2) return false;
            break;
          case 'none':
            if (views > 0) return false;
            break;
        }
      }

      return true;
    });

    this.dataSource.data = this.filteredUsers;
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

  private calculateSummary(): void {
    const total = this.filteredUsers.length;
    const active = this.filteredUsers.filter(
      (u) => u.status === 'active'
    ).length;

    const now = new Date();
    const thisMonth = this.filteredUsers.filter((u) => {
      const regDate = new Date(u.registrationDate);
      return (
        regDate.getMonth() === now.getMonth() &&
        regDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const avgViewed =
      total > 0
        ? this.filteredUsers.reduce((sum, u) => sum + u.propertiesViewed, 0) /
          total
        : 0;

    this.summary = {
      totalUsers: total,
      activeUsers: active,
      newUsersThisMonth: thisMonth,
      avgPropertiesViewed: avgViewed,
    };
  }

  private calculateRoleData(): void {
    const roleCounts = this.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const colors = {
      buyer: '#2196f3',
      seller: '#ff9800',
      agent: '#9c27b0',
      admin: '#f44336',
    };

    this.userRoleData = Object.entries(roleCounts).map(([role, count]) => ({
      label: this.getRoleLabel(role),
      value: Number(count),
      color: colors[role as keyof typeof colors] || '#9e9e9e',
    }));
  }

  private initializeCharts(): void {
    this.createRegistrationChart();
    this.createRoleChart();
  }

  private createRegistrationChart(): void {
    if (!this.registrationChart?.nativeElement) return;

    this.destroyChart('registration');

    const ctx = this.registrationChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const mockData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      data: [45, 52, 38, 67, 73, 89],
    };

    this.charts['registration'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mockData.labels,
        datasets: [
          {
            label: 'Nuevos Usuarios',
            data: mockData.data,
            borderColor: '#388e3c',
            backgroundColor: 'rgba(56, 142, 60, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#388e3c',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
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

  private createRoleChart(): void {
    if (!this.roleChart?.nativeElement) return;

    this.destroyChart('role');

    const ctx = this.roleChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.charts['role'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.userRoleData.map((item) => item.label),
        datasets: [
          {
            data: this.userRoleData.map((item) => item.value),
            backgroundColor: this.userRoleData.map((item) => item.color),
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

  private createActivityChart(): void {
    if (!this.activityChart?.nativeElement || !this.selectedUser) return;

    this.destroyChart('activity');

    const ctx = this.activityChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const mockData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      views: [5, 8, 6, 9, 7, 3, 2],
      contacts: [1, 2, 1, 3, 2, 1, 0],
    };

    this.charts['activity'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mockData.labels,
        datasets: [
          {
            label: 'Vistas',
            data: mockData.views,
            backgroundColor: '#388e3c',
            borderRadius: 4,
          },
          {
            label: 'Contactos',
            data: mockData.contacts,
            backgroundColor: '#66bb6a',
            borderRadius: 4,
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

  private updateCharts(): void {
    if (this.charts['role']) {
      this.charts['role'].data.labels = this.userRoleData.map(
        (item) => item.label
      );
      this.charts['role'].data.datasets[0].data = this.userRoleData.map(
        (item) => item.value
      );
      this.charts['role'].data.datasets[0].backgroundColor =
        this.userRoleData.map((item) => item.color);
      this.charts['role'].update();
    }
  }

  private destroyChart(chartName: string): void {
    if (this.charts[chartName]) {
      this.charts[chartName].destroy();
      delete this.charts[chartName];
    }
  }

  private destroyCharts(): void {
    Object.keys(this.charts).forEach((chartName) => {
      this.destroyChart(chartName);
    });
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    setTimeout(() => {
      this.createActivityChart();
    }, 100);
  }

  closeActivityDetail(): void {
    this.selectedUser = null;
    this.destroyChart('activity');
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      buyer: 'Comprador',
      seller: 'Vendedor',
      agent: 'Agente',
      admin: 'Administrador',
    };
    return labels[role] || role;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Activo',
      inactive: 'Inactivo',
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    return status === 'active' ? 'check_circle' : 'cancel';
  }

  getLoginIndicatorClass(lastLogin: Date): string {
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const hoursDiff = Math.floor(
      (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
    );

    if (hoursDiff < 1) return 'online';
    if (hoursDiff < 24) return 'recent';
    return 'offline';
  }

  getEngagementRate(user: any): number {
    if (user.propertiesViewed === 0) return 0;
    return Math.min(
      Math.round((user.contactsMade / user.propertiesViewed) * 100),
      100
    );
  }

  getEngagementClass(user: any): string {
    const rate = this.getEngagementRate(user);
    if (rate >= 15) return 'high';
    if (rate >= 5) return 'medium';
    return 'low';
  }

  isHighEngagement(user: any): boolean {
    return this.getEngagementRate(user) >= 15;
  }

  refreshData(): void {
    this.loadUsers();
    this.showSuccessMessage('Datos actualizados');
  }

  exportToExcel(): void {
    this.exportService.exportTableToExcel(
      this.filteredUsers,
      'reporte-usuarios',
      'Usuarios'
    );
    this.showSuccessMessage('Reporte exportado exitosamente');
  }

  viewUserActivity(user: any): void {
    this.selectUser(user);
  }

  sendMessage(user: any): void {
    this.showInfoMessage(
      `Funcionalidad de mensaje para ${user.name} en desarrollo`
    );
  }

  viewProfile(user: any): void {
    this.showInfoMessage(
      `Ver perfil de ${user.name} - Funcionalidad en desarrollo`
    );
  }

  exportUserData(user: any): void {
    this.showSuccessMessage(`Datos de ${user.name} exportados`);
  }

  toggleUserStatus(user: any): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    user.status = newStatus;

    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = { ...user };
    }

    this.applyFilters();
    this.showSuccessMessage(
      `Usuario ${
        newStatus === 'active' ? 'activado' : 'desactivado'
      } exitosamente`
    );
  }

  deleteUser(user: any): void {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario "${user.name}"?`,
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
        this.users = this.users.filter((u) => u.id !== user.id);
        this.applyFilters();
        this.calculateRoleData();
        this.updateCharts();
        this.showSuccessMessage(
          `Usuario "${user.name}" eliminado exitosamente`
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
