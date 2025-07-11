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
      await this.msalService.instance.handleRedirectPromise();

      const accounts = this.msalService.instance.getAllAccounts();

      if (accounts.length > 0) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error en auth-callback:', error);
      this.router.navigate(['/login'], {
        queryParams: { error: 'authentication_failed' },
      });
    }
  }
}
