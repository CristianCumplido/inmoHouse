import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserRole } from 'src/app/core/models/roles.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isRegisterMode = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private msalService: MsalService,
    private role: RoleService,
    private router: Router
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

  loginWithCredentials() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Login manual:', email, password);
      this.role.setUser({
        id: '1',
        name: 'Cristian Cumplido',
        email: email,
        role: UserRole.ADMIN, // Simulando que es un agente
      });
      this.router.navigate(['./admin']);

      // Aquí conectas con backend para login manual
    }
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
      // Aquí conectas con backend para registrar
    }
  }

  loginWithAzure() {
    this.msalService.loginRedirect();
  }
}
