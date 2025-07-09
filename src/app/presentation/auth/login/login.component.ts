import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';
import { PublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from 'src/app/msal.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isRegisterMode = false;
  private authService = inject(AuthService);

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

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }
  ngOnInit() {
    // Asegurarse de que MSAL esté inicializado
    if (!this.msalService.instance.getActiveAccount()) {
      this.msalService.instance.handleRedirectPromise().then(() => {
        // Inicialización completada
      });
    }
  }
  loginWithCredentials() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Login manual:', email, password);
      this.role.setUser({
        id: '1',
        name: 'Cristian Cumplido',
        email: email,
        role: UserRole.ADMIN,
      });
      // this.router.navigate(['./admin']);
      const user = {
        email: email,
        password: password,
      };
      this.authService.logout(user).subscribe({
        next: (response: any) => {
          // console.log('Usuario Logeado:', response);
          let data = response.data;
          console.log('Datos del usuario:', data.user.role);
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
      // Aquí conectas con backend para login manual
    }
  }
  mostrarNotificacion(message: string, duration: number = 5000) {
    this.snackBar.open(message, 'Cerrar', {
      duration: duration, // Duración en milisegundos
      verticalPosition: 'top', // 'bottom' | 'top'
      horizontalPosition: 'right', // 'start' | 'center' | 'end' | 'left' | 'right'
      panelClass: ['custom-snackbar'], // clase CSS personalizada (opcional)
    });
  }
  registerWithCredentials() {
    if (this.registerForm.valid) {
      const { name, email, password, confirmPassword } =
        this.registerForm.value;
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      console.log('Registro manual:', name, email);
      const newUser = {
        name: name,
        email: email,
        password: password,
        role: UserRole.CLIENT,
        phone: '573001234567',
      };
      // Aquí conectas con backend para registrar
      this.authService.register(newUser).subscribe({
        next: (response) => {
          this.registerForm.reset();
          console.log('Usuario registrado:', response);
          this.mostrarNotificacion(
            'Registro exitoso. Ahora puedes iniciar sesión.',
            5000
          );
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
