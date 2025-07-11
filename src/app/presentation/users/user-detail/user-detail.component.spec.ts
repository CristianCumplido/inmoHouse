// user-detail.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { UserDetailComponent } from './user-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/application/services/user/user.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';

// Mocks
const mockUser = {
  id: '123',
  name: 'Test User',
  role: UserRole.CLIENT,
  email: 'user@user.com',
};

const mockUserService = {
  getById: jest.fn(),
  delete: jest.fn(),
};

const mockRoleService = {
  isAdmin: jest.fn(),
  isAgent: jest.fn(),
};

const mockLocation = {
  back: jest.fn(),
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

const mockRouter = {
  navigate: jest.fn(),
};

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '123' } } },
        },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => jest.clearAllMocks());

  it('should load user on init', fakeAsync(() => {
    mockUserService.getById.mockReturnValue(of(mockUser));

    component.ngOnInit();
    tick();

    expect(mockUserService.getById).toHaveBeenCalledWith('123');
    expect(component.user).toEqual(mockUser);
    expect(component.loading).toBe(false);
  }));

  it('should handle error on user load', fakeAsync(() => {
    mockUserService.getById.mockReturnValue(
      throwError(() => new Error('Load error'))
    );

    component.ngOnInit();
    tick();

    expect(component.error).toBe(
      'No se pudo cargar la información del usuario'
    );
    expect(component.loading).toBe(false);
  }));

  it('should return correct role color and icon', () => {
    expect(component.getRoleColor(UserRole.ADMIN)).toBe('warn');
    expect(component.getRoleColor(UserRole.AGENT)).toBe('accent');
    expect(component.getRoleColor(UserRole.CLIENT)).toBe('primary');

    expect(component.getRoleIcon(UserRole.ADMIN)).toBe('admin_panel_settings');
    expect(component.getRoleIcon(UserRole.AGENT)).toBe('support_agent');
    expect(component.getRoleIcon(UserRole.CLIENT)).toBe('person');
  });

  it('should return correct permissions based on role', () => {
    mockRoleService.isAdmin.mockReturnValue(true);
    component.user = mockUser;
    expect(component.canEdit).toBe(true);
    expect(component.canDelete).toBe(true);

    mockRoleService.isAdmin.mockReturnValue(false);
    mockRoleService.isAgent.mockReturnValue(true);
    component.user = { ...mockUser, role: UserRole.CLIENT };
    expect(component.canEdit).toBe(true);
  });

  it('should go back when calling goBack()', () => {
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  it('should retry loading user', fakeAsync(() => {
    mockUserService.getById.mockReturnValue(of(mockUser));
    component.retry();
    tick();
    expect(mockUserService.getById).not.toHaveBeenCalledWith('123');
  }));

  it('should delete user after confirmation', fakeAsync(() => {
    mockUserService.getById.mockReturnValue(of(mockUser));
    mockUserService.delete.mockReturnValue(of({}));

    component.ngOnInit();
    tick();
    component.confirmDelete();
    tick();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockUserService.delete).toHaveBeenCalledWith('123');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Usuario eliminado exitosamente',
      'Cerrar',
      expect.anything()
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user/list']);
  }));

  it('should show error if deletion fails', fakeAsync(() => {
    mockUserService.getById.mockReturnValue(of(mockUser));
    mockUserService.delete.mockReturnValue(
      throwError(() => new Error('Error'))
    );

    component.ngOnInit();
    tick();
    component.confirmDelete();
    tick();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error al eliminar el usuario',
      'Cerrar',
      expect.anything()
    );
  }));
});
