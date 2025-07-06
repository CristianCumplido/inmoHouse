import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authRoleGuard } from 'src/app/application/guards/auth/auth-role.guard';
import { UserRole } from 'src/app/core/models/roles.enum';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    component: UserListComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN, UserRole.AGENT])],
  },
  {
    path: 'create',
    component: UserFormComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN, UserRole.AGENT])],
  },
  {
    path: 'edit/:id',
    component: UserFormComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN, UserRole.AGENT])],
  },
  {
    path: 'view/:id',
    component: UserDetailComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN, UserRole.AGENT])],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
