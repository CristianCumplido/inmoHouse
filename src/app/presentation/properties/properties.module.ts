import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyFormComponent } from './property-form/property-form.component';
import { PropertyDetailComponent } from './property-detail/property-detail.component';
import { PropertiesRoutingModule } from './properties.routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PropertyCardComponent } from 'src/app/shared/property-card/property-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
@NgModule({
  declarations: [
    PropertyListComponent,
    PropertyFormComponent,
    PropertyDetailComponent,
    PropertyCardComponent,
  ],
  imports: [
    CommonModule,
    PropertiesRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDividerModule,
  ],
})
export class PropertiesModule {}
