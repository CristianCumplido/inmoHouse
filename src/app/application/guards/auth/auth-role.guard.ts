import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../../services/role/role.service';
import { UserRole } from '../../../core/models/roles.enum';

export const authRoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const roleService = inject(RoleService);
    const router = inject(Router);
    const user = roleService.user();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      router.navigate(['/login']);
      return false;
    }

    return true;
  };
};
