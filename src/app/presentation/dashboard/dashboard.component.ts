import { Component } from '@angular/core';
import { RoleService } from '../../application/services/role/role.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  constructor(public roleService: RoleService) {}
}
