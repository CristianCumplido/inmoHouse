import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ReportsService } from '../../../application/services/reports/reports.service';
import { ExportService } from '../../../application/services/export/export.service';
import { UserReportsComponent } from './user-reports.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

// Mocks
const mockSnackBar = { open: jest.fn() };
const mockDialog = { open: jest.fn(() => ({ afterClosed: () => of(true) })) };
const mockExportService = { exportTableToExcel: jest.fn() };
const mockReportsService = {
  getUserReports: jest.fn(() => of([])),
};

describe('UserReportsComponent (Jest)', () => {
  let component: UserReportsComponent;
  let fixture: ComponentFixture<UserReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserReportsComponent],
      imports: [
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatInputModule,
      ],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: ExportService, useValue: mockExportService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUsers on init', () => {
    const spy = jest.spyOn(component as any, 'loadUsers');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should load mock users if service fails', () => {
    // Arrange
    jest
      .spyOn(mockReportsService, 'getUserReports')
      .mockReturnValueOnce(throwError(() => new Error('Error')));
    const mockMethod = jest.spyOn(component as any, 'loadMockUsers');

    // Act
    component['loadUsers']();

    // Assert
    expect(mockMethod).toHaveBeenCalled();
  });

  it('should apply filters and update filteredUsers', () => {
    // Arrange
    component['users'] = [
      {
        id: 1,
        name: 'Juan',
        role: 'buyer',
        status: 'active',
        registrationDate: new Date(),
        propertiesViewed: 10,
        contactsMade: 3,
      },
      {
        id: 2,
        name: 'Ana',
        role: 'seller',
        status: 'inactive',
        registrationDate: new Date(),
        propertiesViewed: 1,
        contactsMade: 0,
      },
    ];
    component.filtersForm.patchValue({
      role: 'buyer',
      status: '',
      registrationPeriod: '',
      activityLevel: '',
    });

    // Act
    component.applyFilters();

    // Assert
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('Juan');
  });

  it('should clear filters and reset form', () => {
    const patchSpy = jest.spyOn(component.filtersForm, 'reset');
    const applySpy = jest.spyOn(component, 'applyFilters');

    component.clearFilters();

    expect(patchSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Filtros limpiados',
      'Cerrar',
      expect.anything()
    );
  });

  it('should export to Excel and show message', () => {
    component.filteredUsers = [{ name: 'Test' }];

    component.exportToExcel();

    expect(mockExportService.exportTableToExcel).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Reporte exportado exitosamente',
      'Cerrar',
      expect.anything()
    );
  });

  it('should toggle user status and apply filters', () => {
    const user = { id: 1, name: 'Carlos', status: 'active' };
    component['users'] = [user];
    const filterSpy = jest.spyOn(component, 'applyFilters');

    component.toggleUserStatus(user);

    expect(user.status).toBe('inactive');
    expect(filterSpy).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  it('should delete a user after confirmation', fakeAsync(() => {
    const user = { id: 123, name: 'Carlos' };
    component['users'] = [user];

    component.deleteUser(user);
    tick();

    expect(component['users'].length).toBe(0);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Usuario "${user.name}" eliminado exitosamente`,
      'Cerrar',
      expect.anything()
    );
  }));
});
