import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsDashboardComponent } from './report-dashboard/report-dashboard.component';

import { AnalyticsComponent } from './analytics/analytics.component';
import { PropertyReportsComponent } from './property-reports/property-reports.component';
import { UserReportsComponent } from './user-reports/user-reports.component';
import { authRoleGuard } from 'src/app/application/guards/auth/auth-role.guard';
import { UserRole } from 'src/app/core/models/roles.enum';
const routes: Routes = [
  {
    path: '',
    component: ReportsDashboardComponent,
    children: [
      { path: '', redirectTo: 'analytics', pathMatch: 'full' },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        canActivate: [authRoleGuard([UserRole.ADMIN])],
      },
      {
        path: 'properties',
        component: PropertyReportsComponent,
        canActivate: [authRoleGuard([UserRole.ADMIN])],
      },
      {
        path: 'users',
        component: UserReportsComponent,
        canActivate: [authRoleGuard([UserRole.ADMIN])],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
