import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { authRoleGuard } from 'src/app/application/guards/auth/auth-role.guard';
import { UserRole } from 'src/app/core/models/roles.enum';
import { PropertyFormComponent } from './property-form/property-form.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
export const routes: Routes = [
  {
    path: '',
    component: PropertyListComponent,
    canActivate: [
      authRoleGuard([UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]),
    ],
  },
  {
    path: 'create',
    component: PropertyFormComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN])],
  },
  {
    path: 'edit/:id',
    component: PropertyFormComponent,
    canActivate: [authRoleGuard([UserRole.ADMIN])],
  },
  {
    path: 'view/:id',
    component: PropertyDetailComponent,
    canActivate: [
      authRoleGuard([UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]),
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertiesRoutingModule {}
