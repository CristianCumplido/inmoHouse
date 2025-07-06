import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientComponent } from './client/client.component';
import { AgentComponent } from './agent/agent.component';
import { AdminComponent } from './admin/admin.component';
import { MatIconModule } from '@angular/material/icon';
import { DashboardRoutingModule } from './dashboard.routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [
    ClientComponent,
    DashboardComponent,
    AgentComponent,
    AdminComponent,
  ],
  imports: [CommonModule, DashboardRoutingModule, MatIconModule],
})
export class DashboardModule {}
