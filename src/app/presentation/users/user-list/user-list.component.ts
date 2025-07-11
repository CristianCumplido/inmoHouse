import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from 'src/app/application/services/role/role.service';
import { UserService } from 'src/app/application/services/user/user.service';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteDialogData,
} from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  currentRole = this.roleService.role();
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  filterForm = this.fb.group({
    search: [''],
    role: [''],
  });
  roleOptions = Object.entries(UserRole);

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getAll().subscribe((users) => {
      if (this.roleService.isAgent()) {
        this.allUsers = users.filter((u) => u.role === UserRole.CLIENT);
      } else {
        this.allUsers = users;
      }
      this.applyFilters();
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters() {
    this.filteredUsers = this.userService.filterUsers(this.allUsers, {
      role: this.filterForm.value.role as UserRole,
      search: this.filterForm.value.search || undefined,
    });
  }

  get canCreate() {
    return this.roleService.isAdmin() || this.roleService.isAgent();
  }

  canEdit(user: User): boolean {
    if (this.roleService.isAdmin()) return true;
    if (this.roleService.isAgent()) return user.role === UserRole.CLIENT;
    return false;
  }

  canDelete(user: User): boolean {
    return this.canEdit(user);
  }

  /**
   * Obtiene el color del chip según el rol
   */
  getRoleColor(role: UserRole): 'primary' | 'accent' | 'warn' {
    switch (role) {
      case UserRole.ADMIN:
        return 'warn';
      case UserRole.AGENT:
        return 'accent';
      case UserRole.CLIENT:
        return 'primary';
      default:
        return 'primary';
    }
  }

  /**
   * Obtiene el icono según el rol
   */
  getRoleIcon(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'admin_panel_settings';
      case UserRole.AGENT:
        return 'support_agent';
      case UserRole.CLIENT:
        return 'person';
      default:
        return 'person';
    }
  }

  /**
   * Confirma la eliminación del usuario
   */
  confirmDelete(user: User) {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar al usuario "${user.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete(user.id);
      }
    });
  }

  delete(id: string) {
    this.userService.delete(id).subscribe({
      next: () => {
        this.getUsers();

        this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
}
