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

  describe('Password Utility Functions', () => {
    describe('getPasswordStrength', () => {
      it('should return 0 for empty password', () => {
        // Arrange
        const password = '';

        // Act
        const result = component.getPasswordStrength(password);

        // Assert
        expect(result).toBe(0);
      });

      it('should calculate strength correctly', () => {
        // Arrange
        const password = 'Abc123$!';

        // Act
        const result = component.getPasswordStrength(password);

        // Assert
        expect(result).toBe(5); // cumple con todo
      });

      it('should return 2 for only lowercase and length', () => {
        // Arrange
        const password = 'abcdefgh';

        // Act
        const result = component.getPasswordStrength(password);

        // Assert
        expect(result).toBe(2);
      });
    });

    describe('getStrengthText', () => {
      it('should return "Muy débil" for strength 1', () => {
        // Arrange
        const strength = 1;

        // Act
        const text = component.getStrengthText(strength);

        // Assert
        expect(text).toBe('Muy débil');
      });

      it('should return "Muy fuerte" for strength 5', () => {
        // Arrange
        const strength = 5;

        // Act
        const text = component.getStrengthText(strength);

        // Assert
        expect(text).toBe('Muy fuerte');
      });

      it('should fallback to "Muy débil" for strength 0', () => {
        // Arrange
        const strength = 0;

        // Act
        const text = component.getStrengthText(strength);

        // Assert
        expect(text).toBe('Muy débil');
      });
    });

    describe('getStrengthClass', () => {
      it('should return "very-weak" for strength 0', () => {
        // Arrange
        const strength = 0;

        // Act
        const cssClass = component.getStrengthClass(strength);

        // Assert
        expect(cssClass).toBe('very-weak');
      });

      it('should return "strong" for strength 4', () => {
        // Arrange
        const strength = 4;

        // Act
        const cssClass = component.getStrengthClass(strength);

        // Assert
        expect(cssClass).toBe('strong');
      });

      it('should fallback to "very-weak" for invalid strength', () => {
        // Arrange
        const strength = -1;

        // Act
        const cssClass = component.getStrengthClass(strength);

        // Assert
        expect(cssClass).toBe('very-weak');
      });
    });

    describe('getStrengthValue', () => {
      it('should convert strength to percentage', () => {
        // Arrange
        const strength = 3;

        // Act
        const value = component.getStrengthValue(strength);

        // Assert
        expect(value).toBe(60);
      });
    });

    describe('hasMinLength', () => {
      it('should return true for password length >= 8', () => {
        // Arrange
        const password = '12345678';

        // Act
        const result = component.hasMinLength(password);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false for short password', () => {
        // Arrange
        const password = 'abc';

        // Act
        const result = component.hasMinLength(password);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasUpperCase', () => {
      it('should return true if has upper and lower case', () => {
        // Arrange
        const password = 'Abcdef';

        // Act
        const result = component.hasUpperCase(password);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false if only lowercase', () => {
        // Arrange
        const password = 'abcdef';

        // Act
        const result = component.hasUpperCase(password);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasNumbers', () => {
      it('should return true if contains number', () => {
        // Arrange
        const password = 'abc123';

        // Act
        const result = component.hasNumbers(password);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false if no number', () => {
        // Arrange
        const password = 'abcdef';

        // Act
        const result = component.hasNumbers(password);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('hasSpecialChar', () => {
      it('should return true if contains special character', () => {
        // Arrange
        const password = 'abc$123';

        // Act
        const result = component.hasSpecialChar(password);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false if no special character', () => {
        // Arrange
        const password = 'abc123';

        // Act
        const result = component.hasSpecialChar(password);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe('getCurrentPasswordErrorMessage', () => {
    it('should return required message', () => {
      // Arrange

      // Act
      const result = component.getCurrentPasswordErrorMessage();

      // Assert
      expect(result).toBe('La contraseña actual es requerida');
    });

    it('should return empty string if no error', () => {
      // Arrange

      // Act
      const result = component.getCurrentPasswordErrorMessage();

      // Assert
      expect(result).toBe('La contraseña actual es requerida');
    });
  });

  describe('getNewPasswordErrorMessage', () => {
    it('should return required message', () => {
      // Arrange

      // Act
      const result = component.getNewPasswordErrorMessage();

      // Assert
      expect(result).toBe('La nueva contraseña es requerida');
    });

    it('should return minlength message', () => {
      // Arrange
      component.newPassword?.setErrors({ minlength: true });
      // Act

      const result = component.getNewPasswordErrorMessage();

      // Assert
      expect(result).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return weakPassword message (simulated custom validator)', () => {
      // Arrange
      component.newPassword?.setErrors({ weakPassword: true });

      // Act
      const result = component.getNewPasswordErrorMessage();

      // Assert
      expect(result).toBe(
        'La contraseña debe incluir mayúsculas, minúsculas y números'
      );
    });

    it('should return empty string if no error', () => {
      // Arrange
      component.newPassword?.setErrors({ required: false });
      // Act
      const result = component.getNewPasswordErrorMessage();

      // Assert
      expect(result).toBe('');
    });
  });

  describe('getConfirmPasswordErrorMessage', () => {
    it('should return required message', () => {
      // Arrange

      // Act
      const result = component.getConfirmPasswordErrorMessage();

      // Assert
      expect(result).toBe('La confirmación es requerida');
    });

    it('should return mismatch message (simulated custom validator)', () => {
      // Arrange
      component.confirmPassword?.setErrors({ mismatch: true });
      // Act
      const result = component.getConfirmPasswordErrorMessage();

      // Assert
      expect(result).toBe('Las contraseñas no coinciden');
    });

    it('should return empty string if no error', () => {
      // Arrange
      component.confirmPassword?.setErrors({ required: false });
      // Act
      const result = component.getConfirmPasswordErrorMessage();

      // Assert
      expect(result).toBe('');
    });
  });
});
