import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from 'src/app/application/services/auth/auth.service';
import { UserService } from 'src/app/application/services/user/user.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user?: User;
  lastUpdated: Date = new Date();
  isLoading = false;
  showStats = true;
  showQuickStats = true;
  showSecurityInfo = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    let currentUser;
    this.authService.currentUser$.subscribe((user) => {
      currentUser = user;
      console.log('User actualizado:', currentUser);
    });

    if (!currentUser!.id) {
      this.handleError('No se encontró información del usuario');
      return;
    }

    this.isLoading = true;

    this.userService
      .getProfile(currentUser!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.user = response.data;
          this.isLoading = false;
          console.log('Perfil cargado:', this.user);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleError('Error al cargar el perfil');
          console.error('Error loading profile:', error);
        },
      });
  }

  reloadProfile(): void {
    this.loadUserProfile();
  }

  editProfile(): void {
    if (this.user?.id) {
      this.router.navigate(['/profile/edit'], {
        queryParams: { id: this.user.id },
      });
    }
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  toggleTwoFactor(event: MatSlideToggleChange): void {
    if (!this.user?.id) return;

    const newStatus = event.checked;

    if (!newStatus) {
      this.confirmTwoFactorToggle(newStatus);
    } else {
      this.updateTwoFactorStatus(newStatus);
    }
  }

  private confirmTwoFactorToggle(enable: boolean): void {
    const message = enable
      ? '¿Deseas activar la autenticación en dos pasos?'
      : '¿Estás seguro de que quieres desactivar la autenticación en dos pasos?';

    if (confirm(message)) {
      this.updateTwoFactorStatus(enable);
    } else {
      setTimeout(() => {
        if (this.user) {
          this.user.twoFactorEnabled = !enable;
        }
      });
    }
  }

  private updateTwoFactorStatus(enabled: boolean): void {
    if (!this.user?.id) return;

    // this.userService
    //   .updateTwoFactorAuth(this.user.id, enabled)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: () => {
    //       if (this.user) {
    //         this.user.twoFactorEnabled = enabled;
    //       }
    //       this.showMessage(
    //         enabled
    //           ? 'Autenticación en dos pasos activada'
    //           : 'Autenticación en dos pasos desactivada'
    //       );
    //     },
    //     error: (error) => {
    //       // Reset toggle on error
    //       if (this.user) {
    //         this.user.twoFactorEnabled = !enabled;
    //       }
    //       this.handleError('Error al actualizar la configuración de seguridad');
    //       console.error('Error updating 2FA:', error);
    //     },
    //   });
  }

  downloadData(): void {
    if (!this.user?.id) return;

    // this.userService
    //   .downloadUserData(this.user.id)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => {
    //       this.downloadFile(data, `user-data-${this.user?.id}.json`);
    //       this.showMessage('Datos descargados exitosamente');
    //     },
    //     error: () => {
    //       this.handleError('Error al descargar los datos');
    //     },
    //   });
  }

  exportProfile(): void {
    if (!this.user) return;

    const profileData = {
      name: this.user.name,
      email: this.user.email,
      bio: this.user.bio,
      location: this.user.location,
    };

    this.downloadFile(
      JSON.stringify(profileData, null, 2),
      `profile-${this.user.id}.json`
    );
    this.showMessage('Perfil exportado exitosamente');
  }

  deleteAccount(): void {
    const confirmation = confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );

    // if (confirmation && this.user?.id) {
    //   this.userService
    //     .deleteAccount(this.user.id)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe({
    //       next: () => {
    //         this.showMessage('Cuenta eliminada exitosamente');
    //         this.authService.logout();
    //         this.router.navigate(['/login']);
    //       },
    //       error: () => {
    //         this.handleError('Error al eliminar la cuenta');
    //       },
    //     });
    // }
  }

  private downloadFile(data: any, filename: string): void {
    const blob = new Blob(
      [typeof data === 'string' ? data : JSON.stringify(data)],
      {
        type: 'application/json',
      }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
