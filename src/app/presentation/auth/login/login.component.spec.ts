// login.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  FormBuilder,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';

const mockLoginResponse = {
  data: {
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Cliente',
    },
    token: 'mock-jwt-token',
  },
};

const mockRegisterResponse = {
  success: true,
  message: 'Usuario registrado exitosamente',
};

const mockAzureLoginResult = {
  accessToken: 'mock-azure-token',
  account: {
    name: 'John Doe',
    username: 'john@example.com',
  },
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let roleServiceMock: any;
  let routerMock: any;
  let snackBarMock: any;
  let msalServiceMock: any;
  let formBuilder: FormBuilder;

  // Mock sessionStorage
  let sessionStorageMock: any;

  beforeEach(async () => {
    // Mock AuthService
    authServiceMock = {
      login: jest.fn().mockReturnValue(of(mockLoginResponse)),
      register: jest.fn().mockReturnValue(of(mockRegisterResponse)),
      loginWithAzure: jest.fn().mockReturnValue(of(mockLoginResponse)),
    };

    // Mock RoleService
    roleServiceMock = {
      setUser: jest.fn(),
    };

    // Mock Router
    routerMock = {
      navigate: jest.fn(),
    };

    // Mock MatSnackBar
    snackBarMock = {
      open: jest.fn(),
    };

    // Mock MsalService
    const mockMsalInstance = {
      getActiveAccount: jest.fn().mockReturnValue(null),
      handleRedirectPromise: jest.fn().mockResolvedValue(undefined),
    };

    msalServiceMock = {
      instance: mockMsalInstance,
      loginPopup: jest.fn().mockReturnValue(of(mockAzureLoginResult)),
    };

    // Mock sessionStorage
    sessionStorageMock = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
    });

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MsalService, useValue: msalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      // Assert
      expect(component.isRegisterMode).toBe(false);
      expect(component.hideNewPassword).toBe(true);
      expect(component.hideConfirmPassword).toBe(true);
      expect(component.loginForm).toBeDefined();
      expect(component.registerForm).toBeDefined();
    });

    it('should initialize login form with validators', () => {
      // Assert
      expect(component.loginForm.get('email')?.hasError('required')).toBe(true);
      expect(component.loginForm.get('password')?.hasError('required')).toBe(
        true
      );

      // Test email validator
      component.loginForm.get('email')?.setValue('invalid-email');
      expect(component.loginForm.get('email')?.hasError('email')).toBe(true);
    });

    it('should initialize register form with validators', () => {
      // Assert
      expect(component.registerForm.get('name')?.hasError('required')).toBe(
        true
      );
      expect(component.registerForm.get('email')?.hasError('required')).toBe(
        true
      );
      expect(component.registerForm.get('password')?.hasError('required')).toBe(
        true
      );
      expect(
        component.registerForm.get('confirmPassword')?.hasError('required')
      ).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should handle redirect promise when no active account', fakeAsync(() => {
      // Arrange
      msalServiceMock.instance.getActiveAccount.mockReturnValue(null);
      const handleRedirectPromiseSpy =
        msalServiceMock.instance.handleRedirectPromise;

      // Act
      component.ngOnInit();
      tick();

      // Assert
      expect(handleRedirectPromiseSpy).toHaveBeenCalled();
    }));

    it('should not handle redirect promise when active account exists', () => {
      // Arrange
      const mockAccount = { name: 'John Doe' };
      msalServiceMock.instance.getActiveAccount.mockReturnValue(mockAccount);
      const handleRedirectPromiseSpy =
        msalServiceMock.instance.handleRedirectPromise;

      // Act
      component.ngOnInit();

      // Assert
      expect(handleRedirectPromiseSpy).not.toHaveBeenCalled();
    });
  });

  describe('Form Property Getters', () => {
    it('should return password control', () => {
      // Act
      const passwordControl = component.password;

      // Assert
      expect(passwordControl).toBe(component.registerForm.get('password'));
    });

    it('should return confirmPassword control', () => {
      // Act
      const confirmPasswordControl = component.confirmPassword;

      // Assert
      expect(confirmPasswordControl).toBe(
        component.registerForm.get('confirmPassword')
      );
    });
  });

  describe('toggleMode', () => {
    it('should toggle register mode', () => {
      // Arrange
      const initialMode = component.isRegisterMode;

      // Act
      component.toggleMode();

      // Assert
      expect(component.isRegisterMode).toBe(!initialMode);
    });

    it('should toggle back to original mode', () => {
      // Arrange
      const initialMode = component.isRegisterMode;

      // Act
      component.toggleMode();
      component.toggleMode();

      // Assert
      expect(component.isRegisterMode).toBe(initialMode);
    });
  });

  describe('loginWithCredentials', () => {
    it('should login successfully with Cliente role', fakeAsync(() => {
      // Arrange
      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'password123',
      });
      authServiceMock.login.mockReturnValue(of(mockLoginResponse));

      // Act
      component.loginWithCredentials();
      tick();

      // Assert
      expect(authServiceMock.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(roleServiceMock.setUser).toHaveBeenCalledWith({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Cliente',
      });
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token'
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['./client']);
    }));

    it('should navigate to agent route for Agente role', fakeAsync(() => {
      // Arrange
      const agentResponse = {
        data: {
          user: { ...mockLoginResponse.data.user, role: 'Agente' },
          token: 'mock-jwt-token',
        },
      };
      component.loginForm.patchValue({
        email: 'agent@example.com',
        password: 'password123',
      });
      authServiceMock.login.mockReturnValue(of(agentResponse));

      // Act
      component.loginWithCredentials();
      tick();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['./agent']);
    }));

    it('should navigate to admin route for Administrador role', fakeAsync(() => {
      // Arrange
      const adminResponse = {
        data: {
          user: { ...mockLoginResponse.data.user, role: 'Administrador' },
          token: 'mock-jwt-token',
        },
      };
      component.loginForm.patchValue({
        email: 'admin@example.com',
        password: 'password123',
      });
      authServiceMock.login.mockReturnValue(of(adminResponse));

      // Act
      component.loginWithCredentials();
      tick();

      // Assert
      expect(routerMock.navigate).toHaveBeenCalledWith(['./admin']);
    }));

    it('should handle login error', fakeAsync(() => {
      // Arrange
      const error = new Error('Login failed');
      component.loginForm.patchValue({
        email: 'john@example.com',
        password: 'wrongpassword',
      });
      authServiceMock.login.mockReturnValue(throwError(() => error));
      const mostrarNotificacionSpy = jest
        .spyOn(component, 'mostrarNotificacion')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loginWithCredentials();
      tick();

      // Assert
      expect(mostrarNotificacionSpy).toHaveBeenCalledWith(
        'Inicio de sesión fallido. Verifica tu correo y contraseña.',
        5000
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error en el loguear:',
        error
      );
    }));

    it('should not proceed when form is invalid', () => {
      // Arrange
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      // Act
      component.loginWithCredentials();

      // Assert
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });
  });

  describe('registerWithCredentials', () => {
    it('should register successfully', fakeAsync(() => {
      // Arrange
      component.registerForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      const mostrarNotificacionSpy = jest
        .spyOn(component, 'mostrarNotificacion')
        .mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.registerWithCredentials();
      tick();

      // Assert
      expect(authServiceMock.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: UserRole.CLIENT,
        phone: '573001234567',
      });
      expect(mostrarNotificacionSpy).toHaveBeenCalledWith(
        'Registro exitoso. Ahora puedes iniciar sesión.',
        5000
      );
      expect(component.isRegisterMode).toBe(false);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Usuario registrado:',
        mockRegisterResponse
      );
    }));

    it('should handle password mismatch', () => {
      // Arrange
      component.registerForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      });
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      // Act
      component.registerWithCredentials();

      // Assert
      expect(alertSpy).not.toHaveBeenCalledWith('Las contraseñas no coinciden');
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('should handle registration error', fakeAsync(() => {
      // Arrange
      const error = new Error('Registration failed');
      component.registerForm.patchValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      authServiceMock.register.mockReturnValue(throwError(() => error));
      const mostrarNotificacionSpy = jest
        .spyOn(component, 'mostrarNotificacion')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.registerWithCredentials();
      tick();

      // Assert
      expect(mostrarNotificacionSpy).toHaveBeenCalledWith(
        'Registro Fallido. Verifica la información e intenta nuevamente.',
        5000
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error en el registro:',
        error
      );
    }));

    it('should not proceed when form is invalid', () => {
      // Arrange
      component.registerForm.patchValue({
        name: '',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '',
      });

      // Act
      component.registerWithCredentials();

      // Assert
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });
  });

  describe('loginWithAzure', () => {
    it('should login with Azure successfully', fakeAsync(() => {
      // Arrange
      msalServiceMock.loginPopup.mockReturnValue(of(mockAzureLoginResult));
      authServiceMock.loginWithAzure.mockReturnValue(of(mockLoginResponse));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      component.loginWithAzure();
      tick();

      // Assert
      expect(msalServiceMock.loginPopup).toHaveBeenCalled();
      expect(authServiceMock.loginWithAzure).toHaveBeenCalledWith(
        'mock-azure-token'
      );
      expect(roleServiceMock.setUser).toHaveBeenCalled();
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'token',
        'mock-jwt-token'
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['./client']);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Login exitoso:',
        mockAzureLoginResult
      );
    }));

    it('should handle Azure authentication error', fakeAsync(() => {
      // Arrange
      const error = new Error('Azure auth failed');
      const azureResponse = {
        data: {
          user: { ...mockLoginResponse.data.user, role: 'Cliente' },
          token: 'mock-jwt-token',
        },
      };
      msalServiceMock.loginPopup.mockReturnValue(of(mockAzureLoginResult));
      authServiceMock.loginWithAzure.mockReturnValue(throwError(() => error));
      const mostrarNotificacionSpy = jest
        .spyOn(component, 'mostrarNotificacion')
        .mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loginWithAzure();
      tick();

      // Assert
      expect(mostrarNotificacionSpy).toHaveBeenCalledWith(
        'Error al iniciar sesión con Azure. Inténtalo nuevamente.',
        5000
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error en login con Azure:',
        error
      );
    }));

    it('should handle MSAL popup error', fakeAsync(() => {
      // Arrange
      const error = new Error('MSAL popup failed');
      msalServiceMock.loginPopup.mockReturnValue(throwError(() => error));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      component.loginWithAzure();
      tick();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error en login:', error);
    }));
  });

  describe('Password Validation', () => {
    describe('passwordStrengthValidator', () => {
      it('should return null for valid password', () => {
        // Arrange
        const control = { value: 'Password123!' } as AbstractControl;

        // Act
        const result = component.passwordStrengthValidator(control);

        // Assert
        expect(result).toBeNull();
      });

      it('should return error for weak password', () => {
        // Arrange
        const control = { value: 'weak' } as AbstractControl;

        // Act
        const result = component.passwordStrengthValidator(control);

        // Assert
        expect(result).toEqual({ weakPassword: true });
      });

      it('should return null for empty value', () => {
        // Arrange
        const control = { value: '' } as AbstractControl;

        // Act
        const result = component.passwordStrengthValidator(control);

        // Assert
        expect(result).toBeNull();
      });

      it('should validate all password requirements', () => {
        const testCases = [
          { password: 'Password123', expected: null }, // valid (no special char needed)
          { password: 'password123', expected: { weakPassword: true } }, // no uppercase
          { password: 'PASSWORD123', expected: { weakPassword: true } }, // no lowercase
          { password: 'PasswordABC', expected: { weakPassword: true } }, // no numbers
          { password: 'Pass12', expected: { weakPassword: true } }, // too short
        ];

        testCases.forEach(({ password, expected }) => {
          // Arrange
          const control = { value: password } as AbstractControl;

          // Act
          const result = component.passwordStrengthValidator(control);

          // Assert
          expect(result).toEqual(expected);
        });
      });
    });

    describe('passwordMatchValidator', () => {
      it('should return null when passwords match', () => {
        // Arrange
        const mockForm = component.registerForm;
        mockForm.patchValue({
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

        // Act
        const result = component.passwordMatchValidator(mockForm);

        // Assert
        expect(result).toBeNull();
      });

      it('should return mismatch error when passwords do not match', () => {
        // Arrange
        const mockForm = component.registerForm;
        mockForm.patchValue({
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
        });

        // Act
        const result = component.passwordMatchValidator(mockForm);

        // Assert
        expect(result).toEqual({ mismatch: true });
        expect(mockForm.get('confirmPassword')?.hasError('mismatch')).toBe(
          true
        );
      });

      it('should return null when controls are missing', () => {
        // Arrange
        const mockForm = formBuilder.group({});

        // Act
        const result = component.passwordMatchValidator(mockForm);

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('Password Strength Helpers', () => {
    describe('getPasswordStrength', () => {
      it('should return correct strength scores', () => {
        const testCases = [
          { password: '', expected: 0 },
          { password: 'password', expected: 2 }, // length + lowercase
          { password: 'Password', expected: 3 }, // length + lowercase + uppercase
          { password: 'Password1', expected: 4 }, // length + lowercase + uppercase + numbers
          { password: 'Password1!', expected: 5 }, // all criteria
        ];

        testCases.forEach(({ password, expected }) => {
          // Act
          const strength = component.getPasswordStrength(password);

          // Assert
          expect(strength).toBe(expected);
        });
      });
    });

    describe('getStrengthText', () => {
      it('should return correct strength text', () => {
        const testCases = [
          { strength: 0, expected: 'Muy débil' },
          { strength: 1, expected: 'Muy débil' },
          { strength: 2, expected: 'Débil' },
          { strength: 3, expected: 'Regular' },
          { strength: 4, expected: 'Fuerte' },
          { strength: 5, expected: 'Muy fuerte' },
        ];

        testCases.forEach(({ strength, expected }) => {
          // Act
          const text = component.getStrengthText(strength);

          // Assert
          expect(text).toBe(expected);
        });
      });
    });

    describe('getStrengthClass', () => {
      it('should return correct CSS classes', () => {
        const testCases = [
          { strength: 0, expected: 'very-weak' },
          { strength: 1, expected: 'very-weak' },
          { strength: 2, expected: 'weak' },
          { strength: 3, expected: 'fair' },
          { strength: 4, expected: 'strong' },
          { strength: 5, expected: 'very-strong' },
        ];

        testCases.forEach(({ strength, expected }) => {
          // Act
          const cssClass = component.getStrengthClass(strength);

          // Assert
          expect(cssClass).toBe(expected);
        });
      });
    });

    describe('getStrengthValue', () => {
      it('should return correct percentage values', () => {
        const testCases = [
          { strength: 0, expected: 0 },
          { strength: 1, expected: 20 },
          { strength: 2, expected: 40 },
          { strength: 3, expected: 60 },
          { strength: 4, expected: 80 },
          { strength: 5, expected: 100 },
        ];

        testCases.forEach(({ strength, expected }) => {
          // Act
          const value = component.getStrengthValue(strength);

          // Assert
          expect(value).toBe(expected);
        });
      });
    });
  });

  describe('Password Requirements Checkers', () => {
    describe('hasMinLength', () => {
      it('should check minimum length requirement', () => {
        expect(component.hasMinLength('1234567')).toBe(false);
        expect(component.hasMinLength('12345678')).toBe(true);
        expect(component.hasMinLength('')).toBe(false);
      });
    });

    describe('hasUpperCase', () => {
      it('should check for both upper and lower case', () => {
        expect(component.hasUpperCase('Password')).toBe(true);
        expect(component.hasUpperCase('password')).toBe(false);
        expect(component.hasUpperCase('PASSWORD')).toBe(false);
        expect(component.hasUpperCase('')).toBe(false);
      });
    });

    describe('hasNumbers', () => {
      it('should check for numbers', () => {
        expect(component.hasNumbers('Password123')).toBe(true);
        expect(component.hasNumbers('Password')).toBe(false);
        expect(component.hasNumbers('')).toBe(false);
      });
    });

    describe('hasSpecialChar', () => {
      it('should check for special characters', () => {
        expect(component.hasSpecialChar('Password!')).toBe(true);
        expect(component.hasSpecialChar('Password123')).toBe(false);
        expect(component.hasSpecialChar('')).toBe(false);
      });
    });
  });

  describe('Password Change Handler', () => {
    it('should update confirm password validity when password changes', () => {
      // Arrange
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');
      const updateValueAndValiditySpy = jest.spyOn(
        confirmPasswordControl!,
        'updateValueAndValidity'
      );

      // Act
      component.onPasswordChange();

      // Assert
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
    });
  });

  describe('Error Message Getters', () => {
    describe('getNewPasswordErrorMessage', () => {
      it('should return required error message', () => {
        // Arrange
        component.registerForm.get('password')?.setValue('');
        component.registerForm.get('password')?.markAsTouched();

        // Act
        const errorMessage = component.getNewPasswordErrorMessage();

        // Assert
        expect(errorMessage).toBe('La nueva contraseña es requerida');
      });

      it('should return minlength error message', () => {
        // Arrange
        component.registerForm.get('password')?.setValue('123');
        component.registerForm.get('password')?.markAsTouched();

        // Act
        const errorMessage = component.getNewPasswordErrorMessage();

        // Assert
        expect(errorMessage).toBe(
          'La contraseña debe tener al menos 8 caracteres'
        );
      });

      it('should return weak password error message', () => {
        // Arrange
        component.registerForm.get('password')?.setValue('weakpass');
        component.registerForm.get('password')?.markAsTouched();

        // Act
        const errorMessage = component.getNewPasswordErrorMessage();

        // Assert
        expect(errorMessage).toBe(
          'La contraseña debe incluir mayúsculas, minúsculas y números'
        );
      });
    });

    describe('getConfirmPasswordErrorMessage', () => {
      it('should return required error message', () => {
        // Arrange
        component.registerForm.get('confirmPassword')?.setValue('');
        component.registerForm.get('confirmPassword')?.markAsTouched();

        // Act
        const errorMessage = component.getConfirmPasswordErrorMessage();

        // Assert
        expect(errorMessage).toBe('La confirmación es requerida');
      });

      it('should return mismatch error message', () => {
        // Arrange
        component.registerForm.patchValue({
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
        });
        component.passwordMatchValidator(component.registerForm);

        // Act
        const errorMessage = component.getConfirmPasswordErrorMessage();

        // Assert
        expect(errorMessage).toBe('Las contraseñas no coinciden');
      });
    });
  });

  describe('Notification Method', () => {
    it('should show notification with default duration', () => {
      // Arrange
      const message = 'Test message';

      // Act
      component.mostrarNotificacion(message);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['custom-snackbar'],
      });
    });

    it('should show notification with custom duration', () => {
      // Arrange
      const message = 'Test message';
      const duration = 3000;

      // Act
      component.mostrarNotificacion(message, duration);

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(message, 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['custom-snackbar'],
      });
    });
  });

  describe('MSAL Helper Methods', () => {
    describe('isLoggedIn', () => {
      it('should return true when active account exists', () => {
        // Arrange
        msalServiceMock.instance.getActiveAccount.mockReturnValue({
          name: 'John Doe',
        });

        // Act
        const result = component.isLoggedIn();

        // Assert
        expect(result).toBe(true);
      });

      it('should return false when no active account', () => {
        // Arrange
        msalServiceMock.instance.getActiveAccount.mockReturnValue(null);

        // Act
        const result = component.isLoggedIn();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('getUserName', () => {
      it('should return user name when account exists', () => {
        // Arrange
        msalServiceMock.instance.getActiveAccount.mockReturnValue({
          name: 'John Doe',
        });

        // Act
        const userName = component.getUserName();

        // Assert
        expect(userName).toBe('John Doe');
      });

      it('should return empty string when no account', () => {
        // Arrange
        msalServiceMock.instance.getActiveAccount.mockReturnValue(null);

        // Act
        const userName = component.getUserName();

        // Assert
        expect(userName).toBe('');
      });

      it('should return empty string when account has no name', () => {
        // Arrange
        msalServiceMock.instance.getActiveAccount.mockReturnValue({});

        // Act
        const userName = component.getUserName();

        // Assert
        expect(userName).toBe('');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null password in strength validation', () => {
      // Arrange
      const control = { value: null } as AbstractControl;

      // Act
      const result = component.passwordStrengthValidator(control);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle undefined values in password helpers', () => {
      // Act & Assert
      expect(() => component.hasMinLength(undefined as any)).not.toThrow();
      expect(() => component.hasUpperCase(undefined as any)).not.toThrow();
      expect(() => component.hasNumbers(undefined as any)).not.toThrow();
      expect(() => component.hasSpecialChar(undefined as any)).not.toThrow();
    });

    it('should handle edge case in getStrengthText', () => {
      // Act
      const result = component.getStrengthText(-1);

      // Assert
      expect(result).toBe('Muy débil');
    });
  });
});
