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
  { id: '2', name: 'Agente', email: 'agent@test.com', role: UserRole.AGENT },
  { id: '3', name: 'Cliente', email: 'client@test.com', role: UserRole.CLIENT },
];

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceMock: any;
  let roleServiceMock: any;
  let dialogMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    // Configurar mocks
    userServiceMock = {
      getAll: jest.fn().mockReturnValue(of(mockUsers)),
      filterUsers: jest.fn().mockReturnValue(mockUsers),
      delete: jest.fn().mockReturnValue(of({})),
    };

    roleServiceMock = {
      role: jest.fn().mockReturnValue(UserRole.ADMIN),
      isAdmin: jest.fn().mockReturnValue(true),
      isAgent: jest.fn().mockReturnValue(false),
    };

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true),
      }),
    };

    snackBarMock = {
      open: jest.fn(),
    };

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
        { provide: UserService, useValue: userServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;

    // NO llamar fixture.detectChanges() aquí para controlar cuándo se ejecuta ngOnInit
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getUsers', () => {
      // Crear el spy ANTES de ngOnInit
      const getUsersSpyOn = jest
        .spyOn(component, 'getUsers')
        .mockImplementation(() => {});

      // Ejecutar ngOnInit
      component.ngOnInit();

      // Verificar que se llamó
      expect(getUsersSpyOn).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should load users and apply filters', () => {
      // Arrange
      userServiceMock.getAll.mockReturnValue(of(mockUsers));
      userServiceMock.filterUsers.mockReturnValue(mockUsers);
      roleServiceMock.isAgent.mockReturnValue(false);

      // Act
      component.getUsers();

      // Assert
      expect(userServiceMock.getAll).toHaveBeenCalled();
      expect(component.allUsers).toEqual(mockUsers);
      expect(component.filteredUsers).toEqual(mockUsers);
    });

    it('should filter CLIENT users if current role is AGENT', () => {
      const clientUsers = [mockUsers[2]];
      userServiceMock.getAll.mockReturnValue(of(mockUsers));
      userServiceMock.filterUsers.mockReturnValue(clientUsers);
      roleServiceMock.isAgent.mockReturnValue(true);

      component.getUsers();

      expect(component.allUsers).toEqual(clientUsers);
    });
  });

  describe('applyFilters', () => {
    it('should call filterUsers with form values', () => {
      // Arrange
      userServiceMock.filterUsers.mockReturnValue(mockUsers);
      component.allUsers = mockUsers;
      component.filterForm.patchValue({
        role: UserRole.ADMIN,
        search: 'admin',
      });

      // Act
      component.applyFilters();

      // Assert
      expect(userServiceMock.filterUsers).toHaveBeenCalledWith(mockUsers, {
        role: UserRole.ADMIN,
        search: 'admin',
      });
    });
  });

  describe('canEdit / canDelete', () => {
    it('should return true if admin', () => {
      roleServiceMock.isAdmin.mockReturnValue(true);
      expect(component.canEdit(mockUsers[0])).toBe(true);
      expect(component.canDelete(mockUsers[0])).toBe(true);
    });

    it('should return true if agent and user is client', () => {
      roleServiceMock.isAdmin.mockReturnValue(false);
      roleServiceMock.isAgent.mockReturnValue(true);
      expect(component.canEdit(mockUsers[2])).toBe(true);
    });

    it('should return false otherwise', () => {
      roleServiceMock.isAdmin.mockReturnValue(false);
      roleServiceMock.isAgent.mockReturnValue(false);
      expect(component.canEdit(mockUsers[2])).toBe(false);
    });
  });

  describe('getRoleColor', () => {
    it('should return color based on role', () => {
      expect(component.getRoleColor(UserRole.ADMIN)).toBe('warn');
      expect(component.getRoleColor(UserRole.AGENT)).toBe('accent');
      expect(component.getRoleColor(UserRole.CLIENT)).toBe('primary');
    });
  });

  describe('getRoleIcon', () => {
    it('should return icon based on role', () => {
      expect(component.getRoleIcon(UserRole.ADMIN)).toBe(
        'admin_panel_settings'
      );
      expect(component.getRoleIcon(UserRole.AGENT)).toBe('support_agent');
      expect(component.getRoleIcon(UserRole.CLIENT)).toBe('person');
    });
  });

  describe('confirmDelete', () => {
    it('should open dialog and delete user if confirmed', () => {
      const deleteSpy = jest
        .spyOn(component, 'delete')
        .mockImplementation(() => {});

      component.confirmDelete(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith(mockUsers[0].id);
    });
  });

  describe('delete', () => {
    it('should delete user and show success message', () => {
      userServiceMock.delete.mockReturnValue(of({}));
      const getUsersSpy = jest
        .spyOn(component, 'getUsers')
        .mockImplementation(() => {});

      component.delete('1');

      expect(userServiceMock.delete).toHaveBeenCalledWith('1');
      expect(getUsersSpy).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Usuario eliminado exitosamente',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('should show error message on delete failure', () => {
      userServiceMock.delete.mockReturnValue(
        throwError(() => new Error('Error'))
      );

      component.delete('1');

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al eliminar el usuario',
        'Cerrar',
        expect.any(Object)
      );
    });
  });

  describe('Integration tests', () => {
    it('should load users on init', () => {
      // Este test simula el comportamiento real
      fixture.detectChanges(); // Esto ejecuta ngOnInit

      expect(userServiceMock.getAll).toHaveBeenCalled();
      expect(component.allUsers.length).toBe(3);
      expect(component.filteredUsers.length).toBe(3);
    });

    it('should apply filters based on form values', () => {
      fixture.detectChanges(); // Ejecutar ngOnInit primero

      // Configurar mock para filtro específico
      const filteredUsers = [mockUsers[2]]; // Solo cliente
      userServiceMock.filterUsers.mockReturnValue(filteredUsers);

      component.filterForm.patchValue({ role: UserRole.CLIENT });
      component.applyFilters();

      expect(component.filteredUsers).toEqual(filteredUsers);
    });
  });
});
