import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { ReportsDashboardComponent } from './report-dashboard/report-dashboard.component';
// import { UserReportsComponent } from './components/user-reports/user-reports.component';
// import { SalesReportsComponent } from './components/sales-reports/sales-reports.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { PropertyReportsComponent } from './property-reports/property-reports.component';
import { UserReportsComponent } from './user-reports/user-reports.component';
import { ReportsRoutingModule } from './reports.routing.module';

// Routes

@NgModule({
  declarations: [
    ReportsDashboardComponent,

    // UserReportsComponent,
    // SalesReportsComponent,
    AnalyticsComponent,
    PropertyReportsComponent,
    UserReportsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
