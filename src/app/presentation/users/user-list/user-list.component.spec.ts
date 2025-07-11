// user-list.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UserService } from 'src/app/application/services/user/user.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
const mockUsers: User[] = [
  { id: '1', name: 'Admin', email: 'admin@test.com', role: UserRole.ADMIN },
  { id: '2', name: 'Client', email: 'client@test.com', role: UserRole.CLIENT },
];

const mockUserService = {
  getAll: jest.fn(() => of(mockUsers)),
  delete: jest.fn(() => of(undefined)),
  filterUsers: jest.fn((users, filter) =>
    users.filter((u: any) => !filter.role || u.role === filter.role)
  ),
};

const mockRoleService = {
  role: jest.fn(() => UserRole.ADMIN),
  isAdmin: jest.fn(() => true),
  isAgent: jest.fn(() => false),
};

const mockSnackBar = {
  open: jest.fn(),
};

const mockDialogRef = {
  afterClosed: () => of(true),
};

const mockDialog = {
  open: jest.fn(() => mockDialogRef),
};

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [
        ReactiveFormsModule,
        MatMenuModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(mockUserService.getAll).toHaveBeenCalled();
    expect(component.allUsers.length).toBe(2);
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should apply filters based on form values', () => {
    component.filterForm.patchValue({ role: UserRole.CLIENT });
    component.applyFilters();
    expect(
      component.filteredUsers.every((u) => u.role === UserRole.CLIENT)
    ).toBe(true);
  });

  it('should return true for canEdit and canDelete if admin', () => {
    const user = mockUsers[0];
    expect(component.canEdit(user)).toBe(true);
    expect(component.canDelete(user)).toBe(true);
  });

  it('should open confirmation dialog and delete user on confirm', fakeAsync(() => {
    const user = mockUsers[0];
    component.confirmDelete(user);
    tick();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockUserService.delete).toHaveBeenCalledWith(user.id);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Usuario eliminado exitosamente',
      'Cerrar',
      expect.anything()
    );
  }));

  it('should show error snackbar if delete fails', fakeAsync(() => {
    const user = mockUsers[0];
    mockUserService.delete = jest.fn(() =>
      throwError(() => new Error('Error'))
    );

    component.delete(user.id);
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error al eliminar el usuario',
      'Cerrar',
      expect.anything()
    );
  }));
});
