import { Component, inject, Input } from '@angular/core';
import { RoleService } from 'src/app/application/services/role/role.service';
import { Property } from 'src/app/core/models/property.model';

@Component({
  selector: 'app-property-card',
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss'],
})
export class PropertyCardComponent {
  @Input() property!: Property;
  private roleService = inject(RoleService);

  get canContact(): boolean {
    return !(this.roleService.isAdmin() || this.roleService.isAgent());
  }
}
