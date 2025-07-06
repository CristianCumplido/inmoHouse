import { AuthModule } from './presentation/auth/auth.module';
import { DashboardModule } from './presentation/dashboard/dashboard.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertiesModule } from './presentation/properties/properties.module';
import { UsersModule } from './presentation/users/users.module';
import { ProfileModule } from './presentation/profile/profile.module';
import { ChangePasswordModule } from './presentation/change-password/change-password.module';
import { ReportsModule } from './presentation/reports/reports.module';
const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./presentation/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./presentation/properties/properties.module').then(
        (m) => m.PropertiesModule
      ),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./presentation/users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'user/profile',
    loadChildren: () =>
      import('./presentation/profile/profile.module').then(
        (m) => m.ProfileModule
      ),
  },
  {
    path: 'user/change-password',
    loadChildren: () =>
      import('./presentation/change-password/change-password.module').then(
        (m) => m.ChangePasswordModule
      ),
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./presentation/reports/reports.module').then(
        (m) => m.ReportsModule
      ),
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule,
    AuthModule,
    DashboardModule,
    PropertiesModule,
    UsersModule,
    ProfileModule,
    ChangePasswordModule,
    ReportsModule,
  ],
})
export class AppRoutingModule {}
