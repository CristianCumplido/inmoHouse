import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: ValidationErrors = {};

      if (password.length < 8) {
        errors['minLength'] = {
          requiredLength: 8,
          actualLength: password.length,
        };
      }

      if (!/[A-Z]/.test(password)) {
        errors['requiresUppercase'] = true;
      }

      if (!/[a-z]/.test(password)) {
        errors['requiresLowercase'] = true;
      }

      if (!/[0-9]/.test(password)) {
        errors['requiresNumber'] = true;
      }

      if (!/[^A-Za-z0-9]/.test(password)) {
        errors['requiresSpecialChar'] = true;
      }

      const commonPatterns = [
        /123456/,
        /qwerty/i,
        /password/i,
        /admin/i,
        /letmein/i,
      ];

      if (commonPatterns.some((pattern) => pattern.test(password))) {
        errors['commonPassword'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static passwordMatch(
    passwordField: string,
    confirmPasswordField: string
  ): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get(passwordField);
      const confirmPassword = form.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({
          ...confirmPassword.errors,
          passwordMismatch: true,
        });
        return { passwordMismatch: true };
      }

      if (confirmPassword.errors?.['passwordMismatch']) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const hasWhitespace = /\s/.test(control.value);
      return hasWhitespace ? { whitespace: true } : null;
    };
  }

  static notSameAsOld(oldPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.parent) {
        return null;
      }

      const oldPassword = control.parent.get(oldPasswordField);
      if (!oldPassword) {
        return null;
      }

      return control.value === oldPassword.value ? { sameAsOld: true } : null;
    };
  }
}
