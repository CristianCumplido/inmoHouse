import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
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
    switch (strength) {
      case 0:
      case 1:
        return 'Muy débil';
      case 2:
        return 'Débil';
      case 3:
        return 'Regular';
      case 4:
        return 'Fuerte';
      case 5:
        return 'Muy fuerte';
      default:
        return '';
    }
  }

  getStrengthColor(strength: number): string {
    switch (strength) {
      case 0:
      case 1:
        return 'warn';
      case 2:
        return 'accent';
      case 3:
        return 'accent';
      case 4:
        return 'primary';
      case 5:
        return 'primary';
      default:
        return 'warn';
    }
  }

  getStrengthValue(strength: number): number {
    return (strength / 5) * 100;
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      const formData = this.changePasswordForm.value;

      // Simular llamada al servicio
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.changePasswordForm.reset();
      }, 2000);
    } else {
      this.snackBar.open(
        'Por favor, complete todos los campos correctamente',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }

  // Getters para fácil acceso a los controles
  get currentPassword() {
    return this.changePasswordForm.get('currentPassword');
  }
  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }
  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }

  // Métodos para obtener mensajes de error
  getCurrentPasswordErrorMessage() {
    if (this.currentPassword?.hasError('required')) {
      return 'La contraseña actual es requerida';
    }
    return '';
  }

  getNewPasswordErrorMessage() {
    if (this.newPassword?.hasError('required')) {
      return 'La nueva contraseña es requerida';
    }
    if (this.newPassword?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return '';
  }

  getConfirmPasswordErrorMessage() {
    if (this.confirmPassword?.hasError('required')) {
      return 'La confirmación es requerida';
    }
    if (this.confirmPassword?.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
