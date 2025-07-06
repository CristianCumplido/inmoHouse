import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRole } from '../../core/models/roles.enum';
import { authRoleGuard } from '../../application/guards/auth/auth-role.guard';
import { AdminComponent } from './admin/admin.component';
import { AgentComponent } from './agent/agent.component';
import { ClientComponent } from './client/client.component';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authRoleGuard([UserRole.ADMIN])],
    component: AdminComponent,
  },
  {
    path: 'agent',
    canActivate: [authRoleGuard([UserRole.AGENT])],
    component: AgentComponent,
  },
  {
    path: 'client',
    canActivate: [authRoleGuard([UserRole.CLIENT])],
    component: ClientComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
