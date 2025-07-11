import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';
import { PublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from 'src/app/msal.config';
import { PasswordStrengthService } from 'src/app/application/services/password-strength/password-strength.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isRegisterMode = false;
  private authService = inject(AuthService);
  hideNewPassword = true;
  hideConfirmPassword = true;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msalService: MsalService,
    private role: RoleService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }
  passwordStrengthValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    if (!control.value) return null;

    const password = control.value;
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers;

    return isValid ? null : { weakPassword: true };
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }
  ngOnInit() {
    if (!this.msalService.instance.getActiveAccount()) {
      this.msalService.instance.handleRedirectPromise().then(() => {});
    }
  }
  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }
  get confirmPassword(): AbstractControl | null {
    return this.registerForm.get('confirmPassword');
  }
  loginWithCredentials() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      const user = {
        email: email,
        password: password,
      };
      this.authService.login(user).subscribe({
        next: (response: any) => {
          let data = response.data;
          this.role.setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
          sessionStorage.setItem('token', data.token);
          if (data.user.role == 'Cliente') {
            this.router.navigate(['./client']);
          } else if (data.user.role == 'Agente') {
            this.router.navigate(['./agent']);
          } else if (data.user.role == 'Administrador') {
            this.router.navigate(['./admin']);
          }
        },
        error: (error) => {
          this.mostrarNotificacion(
            'Inicio de sesión fallido. Verifica tu correo y contraseña.',
            5000
          );
          console.error('Error en el loguear:', error);
        },
      });
    }
  }
  mostrarNotificacion(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Cerrar', {
      duration: duration,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['custom-snackbar'],
    });
  }

  passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const newPassword = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    const errors = confirmPassword.errors;
    if (errors) {
      delete errors['mismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  getPasswordStrength(password: string): number {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }

  getStrengthText(strength: number): string {
    const strengthTexts = [
      'Muy débil',
      'Débil',
      'Regular',
      'Fuerte',
      'Muy fuerte',
    ];
    return strengthTexts[Math.max(0, strength - 1)] || 'Muy débil';
  }

  getStrengthClass(strength: number): string {
    const strengthClasses = [
      'very-weak',
      'weak',
      'fair',
      'strong',
      'very-strong',
    ];
    return strengthClasses[Math.max(0, strength - 1)] || 'very-weak';
  }

  getStrengthValue(strength: number): number {
    return (strength / 5) * 100;
  }

  hasMinLength(password: string): boolean {
    return password ? password.length >= 8 : false;
  }

  hasUpperCase(password: string): boolean {
    return password ? /[A-Z]/.test(password) && /[a-z]/.test(password) : false;
  }

  hasNumbers(password: string): boolean {
    return password ? /[0-9]/.test(password) : false;
  }

  hasSpecialChar(password: string): boolean {
    return password ? /[^A-Za-z0-9]/.test(password) : false;
  }

  onPasswordChange(): void {
    this.registerForm.get('confirmPassword')?.updateValueAndValidity();
  }

  getNewPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) {
      return 'La nueva contraseña es requerida';
    }
    if (this.password?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (this.password?.hasError('weakPassword')) {
      return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) {
      return 'La confirmación es requerida';
    }
    if (this.confirmPassword?.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
  registerWithCredentials() {
    if (this.registerForm.valid) {
      const { name, email, password, confirmPassword } =
        this.registerForm.value;
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      const newUser = {
        name: name,
        email: email,
        password: password,
        role: UserRole.CLIENT,
        phone: '573001234567',
      };
      this.authService.register(newUser).subscribe({
        next: (response) => {
          this.registerForm.reset();
          console.log('Usuario registrado:', response);
          this.mostrarNotificacion(
            'Registro exitoso. Ahora puedes iniciar sesión.',
            5000
          );
          this.isRegisterMode = false;
        },
        error: (error) => {
          this.mostrarNotificacion(
            'Registro Fallido. Verifica la información e intenta nuevamente.',
            5000
          );
          console.error('Error en el registro:', error);
        },
      });
    }
  }

  async loginWithAzure() {
    this.msalService.loginPopup(loginRequest).subscribe({
      next: (result) => {
        console.log('Login exitoso:', result);
        this.authService.loginWithAzure(result.accessToken).subscribe({
          next: (response: any) => {
            console.log('Respuesta de Azure:', response);
            console.log('Usuario Logeado con Azure:', response);
            let data = response.data;
            this.role.setUser({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
            });
            sessionStorage.setItem('token', data.token);
            if (data.user.role == 'Cliente') {
              this.router.navigate(['./client']);
            } else if (data.user.role == 'Agente') {
              this.router.navigate(['./agent']);
            } else if (data.user.role == 'Administrador') {
              this.router.navigate(['./admin']);
            }
          },
          error: (error) => {
            this.mostrarNotificacion(
              'Error al iniciar sesión con Azure. Inténtalo nuevamente.',
              5000
            );
            console.error('Error en login con Azure:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error en login:', error);
      },
    });
  }
  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() !== null;
  }

  getUserName(): string {
    const account = this.msalService.instance.getActiveAccount();
    return account?.name || '';
  }
}
