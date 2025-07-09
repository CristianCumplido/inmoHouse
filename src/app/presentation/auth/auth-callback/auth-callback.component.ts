import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="auth-callback-container">
      <div class="loading-spinner">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        <p>Procesando autenticación...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-callback-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
      }
      .loading-spinner {
        text-align: center;
        width: 300px;
      }
    `,
  ],
})
export class AuthCallbackComponent implements OnInit {
  constructor(private msalService: MsalService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      // Esperar a que MSAL procese la respuesta de autenticación
      await this.msalService.instance.handleRedirectPromise();

      // Verificar si el usuario está autenticado
      const accounts = this.msalService.instance.getAllAccounts();

      if (accounts.length > 0) {
        // Usuario autenticado exitosamente, redirigir a la página principal
        this.router.navigate(['/']);
      } else {
        // No hay cuentas autenticadas, redirigir al login
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error en auth-callback:', error);
      // Manejar el error apropiadamente
      this.router.navigate(['/login'], {
        queryParams: { error: 'authentication_failed' },
      });
    }
  }
}
