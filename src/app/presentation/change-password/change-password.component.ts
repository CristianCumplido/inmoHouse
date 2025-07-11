import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { UserService } from 'src/app/application/services/user/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.changePasswordForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  private createForm(): FormGroup {
    return this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
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

  // Custom validator for password strength
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

  passwordMatchValidator(form: AbstractControl): { [key: string]: any } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    // Clear mismatch error if passwords match
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

  // Password requirement checkers
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
    // Trigger form validation when password changes
    this.changePasswordForm.get('confirmPassword')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formData = this.changePasswordForm.value;
      const userId = this.authService.getUser()?.id || '1';
      const currentPassword = formData.currentPassword;
      const newPassword = formData.newPassword;

      this.userService
        .changePassword(userId, currentPassword, newPassword)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.showSuccessMessage('Contraseña cambiada exitosamente');
            this.resetForm();
          },
          error: (error) => {
            this.isLoading = false;
            this.handleError(error);
          },
        });
    } else {
      this.markFormGroupTouched(this.changePasswordForm);
      this.showErrorMessage(
        'Por favor, complete todos los campos correctamente'
      );
    }
  }

  private resetForm(): void {
    this.changePasswordForm.reset();
    this.hideCurrentPassword = true;
    this.hideNewPassword = true;
    this.hideConfirmPassword = true;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private handleError(error: any): void {
    let errorMessage = 'Error al cambiar la contraseña';

    if (error.status === 400) {
      errorMessage = 'La contraseña actual es incorrecta';
    } else if (error.status === 422) {
      errorMessage = 'La nueva contraseña no cumple con los requisitos';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Inténtalo más tarde';
    }

    this.showErrorMessage(errorMessage);
  }

  // Getters for easy access to form controls
  get currentPassword(): AbstractControl | null {
    return this.changePasswordForm.get('currentPassword');
  }

  get newPassword(): AbstractControl | null {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword(): AbstractControl | null {
    return this.changePasswordForm.get('confirmPassword');
  }

  // Error message methods
  getCurrentPasswordErrorMessage(): string {
    if (this.currentPassword?.hasError('required')) {
      return 'La contraseña actual es requerida';
    }
    return '';
  }

  getNewPasswordErrorMessage(): string {
    if (this.newPassword?.hasError('required')) {
      return 'La nueva contraseña es requerida';
    }
    if (this.newPassword?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (this.newPassword?.hasError('weakPassword')) {
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
}
