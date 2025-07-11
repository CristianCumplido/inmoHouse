import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Chart } from 'chart.js';

import { UserReportsComponent } from './user-reports.component';
import {
  ReportsService,
  UserReport,
} from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';

// Mock Chart.js
jest.mock('chart.js', () => {
  const mockChart = {
    destroy: jest.fn(),
    update: jest.fn(),
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }],
    },
  };

  return {
    Chart: jest.fn().mockImplementation(() => mockChart),
    registerables: [],
  };
});

describe('UserReportsComponent', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;
  let mockReportsService: jest.Mocked<ReportsService>;
  let mockExportService: jest.Mocked<ExportService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockFormBuilder: FormBuilder;
  const mockUsers: UserReport[] = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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

  beforeEach(async () => {
    // Arrange - Mock services
    mockReportsService = {
      getUserReports: jest.fn(),
    } as any;

    mockExportService = {
      exportTableToExcel: jest.fn(),
    } as any;

    mockSnackBar = {
      open: jest.fn(),
    } as any;

    mockDialog = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [UserReportsComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ReportsService, useValue: mockReportsService },
        { provide: ExportService, useValue: mockExportService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    mockFormBuilder = TestBed.inject(FormBuilder);

    // Mock ViewChild elements
    component.paginator = { firstPage: jest.fn() } as any;
    component.sort = {} as any;
    component.registrationChart = {
      nativeElement: { getContext: jest.fn().mockReturnValue({}) },
    } as any;
    component.roleChart = {
      nativeElement: { getContext: jest.fn().mockReturnValue({}) },
    } as any;
    component.activityChart = {
      nativeElement: { getContext: jest.fn().mockReturnValue({}) },
    } as any;
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      // Arrange & Act
      mockReportsService.getUserReports.mockReturnValue(of(mockUsers));

      // Assert
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      // Arrange & Act
      mockReportsService.getUserReports.mockReturnValue(of(mockUsers));
      fixture.detectChanges();

      // Assert
      expect(component.filtersForm.value).toEqual({
        role: '',
        status: '',
        registrationPeriod: '',
        activityLevel: '',
      });
    });

    it('should load users on init', () => {
      // Arrange
      mockReportsService.getUserReports.mockReturnValue(of(mockUsers));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockReportsService.getUserReports).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
      expect(component.loading).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should handle successful user data loading', () => {
      // Arrange
      mockReportsService.getUserReports.mockReturnValue(of(mockUsers));

      // Act
      component.loadUsers();

      // Assert
      expect(component.users).toEqual(mockUsers);
      expect(component.filteredUsers.length).toBeGreaterThan(0);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading users and fallback to mock data', () => {
      // Arrange
      const error = new Error('Service error');
      mockReportsService.getUserReports.mockReturnValue(
        throwError(() => error)
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loadUsers();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Error loading users:', error);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar los usuarios',
        expect.any(String),
        expect.any(Object)
      );
      expect(component.users.length).toBeGreaterThan(0); // Mock data loaded
      expect(component.loading).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Filtering Functionality', () => {
    beforeEach(() => {
      component.users = mockUsers;
    });

    it('should filter users by role', () => {
      // Arrange
      component.filtersForm.patchValue({ role: 'buyer' });

      // Act
      component.applyFilters();

      // Assert
      expect(component.filteredUsers).toHaveLength(1);
      expect(component.filteredUsers[0].role).toBe('buyer');
    });

    it('should filter users by status', () => {
      // Arrange
      component.filtersForm.patchValue({ status: 'active' });

      // Act
      component.applyFilters();

      // Assert
      const activeUsers = component.filteredUsers.filter(
        (u) => u.status === 'active'
      );
      expect(activeUsers).toHaveLength(2);
    });

    it('should filter users by activity level - high', () => {
      // Arrange
      component.filtersForm.patchValue({ activityLevel: 'high' });

      // Act
      component.applyFilters();

      // Assert
      const highActivityUsers = component.filteredUsers.filter(
        (u) => u.propertiesViewed >= 10
      );
      expect(component.filteredUsers).toEqual(
        expect.arrayContaining(highActivityUsers)
      );
    });

    it('should clear all filters', () => {
      // Arrange
      component.filtersForm.patchValue({ role: 'buyer', status: 'active' });

      // Act
      component.clearFilters();

      // Assert
      expect(component.filtersForm.value).toEqual({
        role: null,
        status: null,
        registrationPeriod: null,
        activityLevel: null,
      });
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Filtros limpiados',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should apply search filter', () => {
      // Arrange
      const event = { target: { value: 'juan' } } as any;
      component.dataSource = new MatTableDataSource(mockUsers);
      component.dataSource.paginator = component.paginator;

      // Act
      component.applyFilter(event);

      // Assert
      expect(component.dataSource.filter).toBe('juan');
      expect(component.paginator.firstPage).toHaveBeenCalled();
    });
  });

  describe('Summary Calculations', () => {
    beforeEach(() => {
      component.filteredUsers = mockUsers;
    });

    it('should calculate summary correctly', () => {
      // Arrange & Act
      component.calculateSummary();

      // Assert
      expect(component.summary.totalUsers).toBe(3);
      expect(component.summary.activeUsers).toBe(2);
      expect(component.summary.avgPropertiesViewed).toBe((15 + 8 + 25) / 3);
    });

    it('should calculate summary with empty users', () => {
      // Arrange
      component.filteredUsers = [];

      // Act
      component.calculateSummary();

      // Assert
      expect(component.summary.totalUsers).toBe(0);
      expect(component.summary.activeUsers).toBe(0);
      expect(component.summary.avgPropertiesViewed).toBe(0);
    });
  });

  describe('Role Data Calculations', () => {
    beforeEach(() => {
      component.users = mockUsers;
    });

    it('should calculate role data correctly', () => {
      // Arrange & Act
      component.calculateRoleData();

      // Assert
      expect(component.userRoleData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'Comprador', value: 1 }),
          expect.objectContaining({ label: 'Vendedor', value: 1 }),
          expect.objectContaining({ label: 'Agente', value: 1 }),
        ])
      );
    });
  });

  describe('User Actions', () => {
    it('should select user and create activity chart', () => {
      // Arrange
      const user = mockUsers[0];
      jest.spyOn(component, 'createActivityChart');

      // Act
      component.selectUser(user);

      // Assert
      expect(component.selectedUser).toBe(user);
      setTimeout(() => {
        expect(component.createActivityChart).toHaveBeenCalled();
      }, 100);
    });

    it('should close activity detail', () => {
      // Arrange
      component.selectedUser = mockUsers[0];
      jest.spyOn(component, 'destroyChart');

      // Act
      component.closeActivityDetail();

      // Assert
      expect(component.selectedUser).toBeNull();
      expect(component.destroyChart).toHaveBeenCalledWith('activity');
    });

    it('should toggle user status from active to inactive', () => {
      // Arrange
      const user = { ...mockUsers[0] };
      component.users = [user];

      // Act
      component.toggleUserStatus(user);

      // Assert
      expect(user.status).toBe('inactive');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Usuario desactivado exitosamente',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should delete user after confirmation', () => {
      // Arrange
      const user = mockUsers[0];
      component.users = [...mockUsers];
      const dialogRef = { afterClosed: jest.fn().mockReturnValue(of(true)) };
      mockDialog.open.mockReturnValue(dialogRef as any);

      // Act
      component.deleteUser(user);

      // Assert
      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDeleteDialogComponent,
        expect.objectContaining({
          width: '450px',
          data: expect.objectContaining({
            title: 'Eliminar Usuario',
            message: `¿Estás seguro de que deseas eliminar al usuario "${user.name}"?`,
          }),
        })
      );

      dialogRef.afterClosed().subscribe(() => {
        expect(component.users).not.toContain(user);
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          `Usuario "${user.name}" eliminado exitosamente`,
          expect.any(String),
          expect.any(Object)
        );
      });
    });

    it('should not delete user when confirmation is cancelled', () => {
      // Arrange
      const user = mockUsers[0];
      component.users = [...mockUsers];
      const dialogRef = { afterClosed: jest.fn().mockReturnValue(of(false)) };
      mockDialog.open.mockReturnValue(dialogRef as any);
      const originalUsersLength = component.users.length;

      // Act
      component.deleteUser(user);

      // Assert
      dialogRef.afterClosed().subscribe(() => {
        expect(component.users).toHaveLength(originalUsersLength);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should return correct role label', () => {
      // Arrange & Act & Assert
      expect(component.getRoleLabel('buyer')).toBe('Comprador');
      expect(component.getRoleLabel('seller')).toBe('Vendedor');
      expect(component.getRoleLabel('agent')).toBe('Agente');
      expect(component.getRoleLabel('admin')).toBe('Administrador');
      expect(component.getRoleLabel('unknown')).toBe('unknown');
    });

    it('should return correct status label', () => {
      // Arrange & Act & Assert
      expect(component.getStatusLabel('active')).toBe('Activo');
      expect(component.getStatusLabel('inactive')).toBe('Inactivo');
    });

    it('should return correct status icon', () => {
      // Arrange & Act & Assert
      expect(component.getStatusIcon('active')).toBe('check_circle');
      expect(component.getStatusIcon('inactive')).toBe('cancel');
    });

    it('should calculate engagement rate correctly', () => {
      // Arrange
      const user1 = { propertiesViewed: 10, contactsMade: 2 };
      const user2 = { propertiesViewed: 0, contactsMade: 0 };
      const user3 = { propertiesViewed: 5, contactsMade: 6 }; // > 100%

      // Act & Assert
      expect(component.getEngagementRate(user1)).toBe(20);
      expect(component.getEngagementRate(user2)).toBe(0);
      expect(component.getEngagementRate(user3)).toBe(100); // Capped at 100
    });

    it('should return correct engagement class', () => {
      // Arrange
      const highUser = { propertiesViewed: 10, contactsMade: 2 }; // 20%
      const mediumUser = { propertiesViewed: 10, contactsMade: 1 }; // 10%
      const lowUser = { propertiesViewed: 10, contactsMade: 0 }; // 0%

      // Act & Assert
      expect(component.getEngagementClass(highUser)).toBe('high');
      expect(component.getEngagementClass(mediumUser)).toBe('medium');
      expect(component.getEngagementClass(lowUser)).toBe('low');
    });

    it('should identify high engagement users', () => {
      // Arrange
      const highUser = { propertiesViewed: 10, contactsMade: 2 }; // 20%
      const lowUser = { propertiesViewed: 10, contactsMade: 1 }; // 10%

      // Act & Assert
      expect(component.isHighEngagement(highUser)).toBe(true);
      expect(component.isHighEngagement(lowUser)).toBe(false);
    });

    it('should return correct login indicator class', () => {
      // Arrange
      const now = new Date();
      const recentLogin = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
      const onlineLogin = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      const oldLogin = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago

      // Act & Assert
      expect(component.getLoginIndicatorClass(onlineLogin)).toBe('online');
      expect(component.getLoginIndicatorClass(recentLogin)).toBe('recent');
      expect(component.getLoginIndicatorClass(oldLogin)).toBe('offline');
    });
  });

  describe('Export Functionality', () => {
    it('should export filtered users to Excel', () => {
      // Arrange
      component.filteredUsers = mockUsers;

      // Act
      component.exportToExcel();

      // Assert
      expect(mockExportService.exportTableToExcel).toHaveBeenCalledWith(
        mockUsers,
        'reporte-usuarios',
        'Usuarios'
      );
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Reporte exportado exitosamente',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should export individual user data', () => {
      // Arrange
      const user = mockUsers[0];

      // Act
      component.exportUserData(user);

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        `Datos de ${user.name} exportados`,
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data and show success message', () => {
      // Arrange
      mockReportsService.getUserReports.mockReturnValue(of(mockUsers));
      jest.spyOn(component, 'loadUsers');

      // Act
      component.refreshData();

      // Assert
      expect(component.loadUsers).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Datos actualizados',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('Chart Management', () => {
    it('should destroy chart when specified', () => {
      // Arrange
      const mockChart = { destroy: jest.fn() };
      component['charts'] = { testChart: mockChart as any };

      // Act
      component['destroyChart']('testChart');

      // Assert
      expect(mockChart.destroy).toHaveBeenCalled();
      expect(component['charts']['testChart']).toBeUndefined();
    });

    it('should destroy all charts', () => {
      // Arrange
      const mockChart1 = { destroy: jest.fn() };
      const mockChart2 = { destroy: jest.fn() };
      component['charts'] = {
        chart1: mockChart1 as any,
        chart2: mockChart2 as any,
      };

      // Act
      component['destroyCharts']();

      // Assert
      expect(mockChart1.destroy).toHaveBeenCalled();
      expect(mockChart2.destroy).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup on destroy', () => {
      // Arrange
      jest.spyOn(component['destroy$'], 'next');
      jest.spyOn(component['destroy$'], 'complete');
      jest.spyOn(component, 'destroyCharts');

      // Act
      component.ngOnDestroy();

      // Assert
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
      expect(component.destroyCharts).toHaveBeenCalled();
    });

    it('should setup data source after view init', () => {
      // Arrange & Act
      component.ngAfterViewInit();

      // Assert
      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
      expect(component.dataSource.filterPredicate).toBeDefined();
    });
  });

  describe('Message Actions', () => {
    it('should show info message for send message action', () => {
      // Arrange
      const user = mockUsers[0];

      // Act
      component.sendMessage(user);

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        `Funcionalidad de mensaje para ${user.name} en desarrollo`,
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should show info message for view profile action', () => {
      // Arrange
      const user = mockUsers[0];

      // Act
      component.viewProfile(user);

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        `Ver perfil de ${user.name} - Funcionalidad en desarrollo`,
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should select user when viewing activity', () => {
      // Arrange
      const user = mockUsers[0];
      jest.spyOn(component, 'selectUser');

      // Act
      component.viewUserActivity(user);

      // Assert
      expect(component.selectUser).toHaveBeenCalledWith(user);
    });
  });
});
