import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { UserService } from 'src/app/application/services/user/user.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteDialogData,
} from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error: string | null = null;
  private userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser();
    } else {
      this.error = 'ID de usuario no válido';
      this.loading = false;
    }
  }

  private loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.error = null;

    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.error = 'No se pudo cargar la información del usuario';
        this.loading = false;
      },
    });
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
   * Verifica si el usuario actual puede editar
   */
  get canEdit(): boolean {
    if (!this.user) return false;

    if (this.roleService.isAdmin()) return true;
    if (this.roleService.isAgent()) return this.user.role === UserRole.CLIENT;
    return false;
  }

  /**
   * Verifica si el usuario actual puede eliminar
   */
  get canDelete(): boolean {
    return this.canEdit;
  }

  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Reintenta cargar el usuario
   */
  retry(): void {
    this.loadUser();
  }

  /**
   * Confirma la eliminación del usuario
   */
  confirmDelete(): void {
    if (!this.user) return;

    const dialogData: ConfirmDeleteDialogData = {
      title: 'Confirmar eliminación',
      message: `¿Estás seguro que deseas eliminar al usuario "${this.user.name}"?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.user) {
        this.deleteUser();
      }
    });
  }

  /**
   * Elimina el usuario
   */
  private deleteUser(): void {
    if (!this.user) return;

    this.userService.delete(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/user/list']);
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
