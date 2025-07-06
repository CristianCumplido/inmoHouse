import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authRoleGuard } from 'src/app/application/guards/auth/auth-role.guard';
import { UserRole } from 'src/app/core/models/roles.enum';
import { ChangePasswordComponent } from './change-password.component';

const routes: Routes = [
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [
      authRoleGuard([UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]),
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangePasswordRoutingModule {}
