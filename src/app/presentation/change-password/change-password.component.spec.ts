// change-password.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { UserService } from 'src/app/application/services/user/user.service';

// Mocks
const mockSnackBar = {
  open: jest.fn(),
};

const mockAuthService = {
  getUser: jest.fn().mockReturnValue({ id: '123' }),
};

const mockUserService = {
  changePassword: jest.fn(),
};

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit()', () => {
    it('debería cambiar la contraseña correctamente (flujo feliz)', () => {
      // Arrange
      mockUserService.changePassword.mockReturnValue(of({ success: true }));
      component.changePasswordForm.setValue({
        currentPassword: 'Actual123',
        newPassword: 'Nueva123',
        confirmPassword: 'Nueva123',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockUserService.changePassword).toHaveBeenCalledWith(
        '123',
        'Actual123',
        'Nueva123'
      );
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Contraseña cambiada exitosamente',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería mostrar error si el formulario es inválido', () => {
      // Arrange
      component.changePasswordForm.setValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockUserService.changePassword).not.toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Por favor, complete todos los campos correctamente',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería manejar error 400 (contraseña actual incorrecta)', () => {
      // Arrange
      mockUserService.changePassword.mockReturnValue(
        throwError(() => ({ status: 400 }))
      );
      component.changePasswordForm.setValue({
        currentPassword: 'wrongpass',
        newPassword: 'Nueva123',
        confirmPassword: 'Nueva123',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'La contraseña actual es incorrecta',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería manejar error 422 (contraseña nueva inválida)', () => {
      // Arrange
      mockUserService.changePassword.mockReturnValue(
        throwError(() => ({ status: 422 }))
      );
      component.changePasswordForm.setValue({
        currentPassword: 'actual123',
        newPassword: 'Nueva123',
        confirmPassword: 'Nueva123',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'La nueva contraseña no cumple con los requisitos',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería manejar error 500 (servidor)', () => {
      // Arrange
      mockUserService.changePassword.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );
      component.changePasswordForm.setValue({
        currentPassword: 'actual123',
        newPassword: 'Nueva123',
        confirmPassword: 'Nueva123',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error del servidor. Inténtalo más tarde',
        'Cerrar',
        expect.any(Object)
      );
    });
  });
});
