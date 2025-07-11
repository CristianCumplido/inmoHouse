import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsalService } from '@azure/msal-angular';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let roleServiceMock: any;
  let routerMock: any;
  let snackBarMock: any;
  let msalServiceMock: any;

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn(),
      register: jest.fn(),
      loginWithAzure: jest.fn(),
    };

    roleServiceMock = {
      setUser: jest.fn(),
    };

    routerMock = {
      navigate: jest.fn(),
    };

    snackBarMock = {
      open: jest.fn(),
    };

    msalServiceMock = {
      loginPopup: jest.fn(), // ✅ Mock directo sobre MsalService
      instance: {
        getActiveAccount: jest.fn().mockReturnValue(null),
        handleRedirectPromise: jest.fn().mockResolvedValue(null),
      },
    };

    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: MsalService, useValue: msalServiceMock },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('loginWithCredentials', () => {
    it('debería loguear exitosamente con credenciales', () => {
      // Arrange
      component.loginForm.setValue({
        email: 'test@test.com',
        password: '123456',
      });
      const mockResponse = {
        data: {
          token: '123',
          user: {
            id: '1',
            name: 'Test',
            email: 'test@test.com',
            role: 'Administrador',
          },
        },
      };
      authServiceMock.login.mockReturnValue(of(mockResponse));

      // Act
      component.loginWithCredentials();

      // Assert
      expect(authServiceMock.login).toHaveBeenCalled();
      expect(roleServiceMock.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'Administrador' })
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['./admin']);
    });

    it('debería mostrar notificación si falla el login', () => {
      // Arrange
      component.loginForm.setValue({
        email: 'fail@test.com',
        password: '123456',
      });
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('fail'))
      );

      // Act
      component.loginWithCredentials();

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Inicio de sesión fallido. Verifica tu correo y contraseña.',
        'Cerrar',
        expect.any(Object)
      );
    });
  });

  describe('registerWithCredentials', () => {
    it('debería registrar exitosamente un usuario', () => {
      // Arrange
      component.registerForm.setValue({
        name: 'Test',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

      authServiceMock.register.mockReturnValue(of({ data: 'ok' }));

      // Act
      component.registerWithCredentials();

      // Assert
      expect(authServiceMock.register).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Registro exitoso. Ahora puedes iniciar sesión.',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería mostrar error si las contraseñas no coinciden', () => {
      // Arrange
      const spy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      component.registerForm.setValue({
        name: 'Test',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Wrong123',
      });

      // Act
      component.registerWithCredentials();

      // Assert
      expect(authServiceMock.register).not.toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalledWith('Las contraseñas no coinciden');

      spy.mockRestore();
    });
  });

  describe('loginWithAzure', () => {
    it('debería iniciar sesión exitosamente con Azure', async () => {
      // Arrange
      const msalResult = { accessToken: 'azure-token' };
      const response = {
        data: {
          token: 'xyz',
          user: {
            id: '2',
            name: 'Azure User',
            email: 'azure@test.com',
            role: 'Cliente',
          },
        },
      };
      msalServiceMock.loginPopup.mockReturnValue(of(msalResult));
      authServiceMock.loginWithAzure.mockReturnValue(of(response));

      // Act
      await component.loginWithAzure();

      // Assert
      expect(msalServiceMock.loginPopup).toHaveBeenCalled();
      expect(authServiceMock.loginWithAzure).toHaveBeenCalledWith(
        'azure-token'
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['./client']);
    });

    it('debería manejar error al iniciar sesión con Azure', async () => {
      // Arrange
      msalServiceMock.loginPopup.mockReturnValue(of({ accessToken: 'token' }));
      authServiceMock.loginWithAzure.mockReturnValue(
        throwError(() => new Error('Azure login failed'))
      );

      // Act
      await component.loginWithAzure();

      // Assert
      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Error al iniciar sesión con Azure. Inténtalo nuevamente.',
        'Cerrar',
        expect.any(Object)
      );
    });
  });

  describe('passwordStrengthValidator', () => {
    it('debería marcar como inválida una contraseña débil', () => {
      const result = component.passwordStrengthValidator({
        value: '123',
      } as any);
      expect(result).toEqual({ weakPassword: true });
    });

    it('debería marcar como válida una contraseña fuerte', () => {
      const result = component.passwordStrengthValidator({
        value: 'Password123',
      } as any);
      expect(result).toBeNull();
    });
  });

  describe('passwordMatchValidator', () => {
    it('debería devolver mismatch si las contraseñas no coinciden', () => {
      const mockForm: any = {
        get: (key: string) =>
          key === 'password'
            ? { value: 'pass1' }
            : { value: 'pass2', setErrors: jest.fn() },
      };

      const result = component.passwordMatchValidator(mockForm);
      expect(result).toEqual({ mismatch: true });
    });

    it('debería devolver null si las contraseñas coinciden', () => {
      const mockForm: any = {
        get: (key: string) => ({ value: 'pass123', setErrors: jest.fn() }),
      };

      const result = component.passwordMatchValidator(mockForm);
      expect(result).toBeNull();
    });
  });

  describe('getStrengthText', () => {
    it('debería devolver el texto correcto según la fuerza', () => {
      expect(component.getStrengthText(1)).toBe('Muy débil');
      expect(component.getStrengthText(5)).toBe('Muy fuerte');
    });
  });
});
