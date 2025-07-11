// user-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { UserFormComponent } from './user-form.component';
import { UserService } from 'src/app/application/services/user/user.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';

// Mocks
const mockSnackBar = {
  open: jest.fn(),
};

const mockRouter = {
  navigate: jest.fn(),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn(),
    },
  },
};

const mockUserService = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockRoleService = {
  isAdmin: jest.fn(),
  isAgent: jest.fn(),
};

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => jest.clearAllMocks());

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set available roles for admin', () => {
    // Arrange
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
    mockRoleService.isAdmin.mockReturnValue(true);
    mockRoleService.isAgent.mockReturnValue(false);

    // Act
    component.ngOnInit();

    // Assert
    expect(component.availableRoles).toEqual([
      UserRole.ADMIN,
      UserRole.AGENT,
      UserRole.CLIENT,
    ]);
  });

  it('should patch form when editing user', () => {
    // Arrange
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('123');
    mockRoleService.isAdmin.mockReturnValue(false);
    mockRoleService.isAgent.mockReturnValue(true);
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.CLIENT,
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.form.value).toEqual(mockUser);
  });

  it('should call create method if not editing', () => {
    // Arrange
    component.isEdit = false;
    const mockData = {
      name: 'New User',
      email: 'new@example.com',
      role: UserRole.CLIENT,
    };
    component.form.setValue(mockData);
    mockUserService.create.mockReturnValue(of({}));

    // Act
    component.submit();

    // Assert
    expect(mockUserService.create).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Usuario creado correctamente',
      'Cerrar',
      expect.anything()
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
  });

  it('should call update method if editing', () => {
    // Arrange
    component.isEdit = true;
    component.userId = 'abc123';
    const mockData = {
      name: 'Updated User',
      email: 'updated@example.com',
      role: UserRole.AGENT,
    };
    component.form.setValue(mockData);
    mockUserService.update.mockReturnValue(of({}));

    // Act
    component.submit();

    // Assert
    expect(mockUserService.update).toHaveBeenCalledWith(
      'abc123',
      expect.objectContaining({ id: 'abc123', ...mockData })
    );
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Usuario actualizado correctamente',
      'Cerrar',
      expect.anything()
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
  });

  it('should not submit invalid form', () => {
    // Arrange
    component.form.setValue({ name: '', email: '', role: '' });

    // Act
    component.submit();

    // Assert
    expect(mockUserService.create).not.toHaveBeenCalled();
    expect(mockUserService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should navigate back on goBack()', () => {
    // Act
    component.goBack();

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/user']);
  });

  it('should return proper role label', () => {
    expect(component.getRoleLabel(UserRole.ADMIN)).toBe('Administrador');
    expect(component.getRoleLabel(UserRole.AGENT)).toBe('Agente');
    expect(component.getRoleLabel(UserRole.CLIENT)).toBe('Cliente');
  });
});
