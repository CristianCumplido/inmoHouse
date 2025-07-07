import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserService } from 'src/app/application/services/user/user.service';
import { UserRole } from 'src/app/core/models/roles.enum';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
  });

  availableRoles: UserRole[] = [];
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private snackBar = inject(MatSnackBar);

  isEdit = false;
  userId: string | null = null;

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;

    if (this.roleService.isAdmin()) {
      this.availableRoles = [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT];
    } else if (this.roleService.isAgent()) {
      this.availableRoles = [UserRole.CLIENT];
    }

    if (this.isEdit) {
      this.userService.getById(this.userId!).subscribe((user) => {
        this.form.patchValue(user);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEdit) {
      this.userService
        .update(this.userId!, { id: this.userId!, ...this.form.value } as any)
        .subscribe(() => {
          this.router.navigate(['/user']);
          this.showInfoMessage('Usuario actualizado correctamente');
        });
    } else {
      this.userService
        .create({ id: this.generateId(), ...this.form.value } as any)
        .subscribe(() => {
          this.router.navigate(['/user']);
          this.showInfoMessage('Usuario creado correctamente');
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/user']);
  }

  getRoleLabel(role: UserRole): string {
    const roleLabels = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.AGENT]: 'Agente',
      [UserRole.CLIENT]: 'Cliente',
    };
    return roleLabels[role] || role;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
