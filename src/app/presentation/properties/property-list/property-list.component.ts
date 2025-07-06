import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { PropertyService } from '../../../application/services/property/property.service';
import { RoleService } from '../../../application/services/role/role.service';
import { Property } from '../../../core/models/property.model';
import { UserRole } from '../../../core/models/roles.enum';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteDialogData,
} from 'src/app/shared/confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss'],
})
export class PropertyListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data properties
  properties: Property[] = [];
  allProperties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = false;

  // User permissions
  isAdmin = false;

  // Form and filters
  filterForm!: FormGroup;

  // View options
  viewMode: 'grid' | 'list' = 'grid';
  pageSize = 12;

  // Location options
  allLocations: string[] = [
    'Bogotá',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales',
    'Ibagué',
    'Villavicencio',
    'Pasto',
    'Montería',
    'Valledupar',
    'Neiva',
    'Armenia',
    'Popayán',
    'Tunja',
    'Florencia',
    'Riohacha',
    'Santa Marta',
  ];

  constructor(
    private propertyService: PropertyService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.isAdmin = this.roleService.isAdmin();
    this.loadProperties();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      location: [[]],
      minPrice: [''],
      maxPrice: [''],
      search: [''],
      propertyType: [''],
      viewMode: ['grid'],
    });
  }

  private setupFilterSubscription(): void {
    // Debounce search input for better performance
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((formValue) => {
        this.viewMode = formValue.viewMode || 'grid';
        this.applyFilters();
      });
  }

  private loadProperties(): void {
    this.loading = true;

    this.propertyService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (properties) => {
          this.allProperties = properties;
          this.properties = properties;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading properties:', error);
          this.showErrorMessage('Error al cargar las propiedades');
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;

    this.filteredProperties = this.propertyService.filterProperties(
      this.allProperties,
      {
        location:
          formValue.location?.length > 0 ? formValue.location : undefined,
        minPrice: formValue.minPrice ? +formValue.minPrice : undefined,
        maxPrice: formValue.maxPrice ? +formValue.maxPrice : undefined,
        search: formValue.search?.trim() || undefined,
        propertyType: formValue.propertyType || undefined,
      }
    );
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      location: [],
      minPrice: '',
      maxPrice: '',
      search: '',
      propertyType: '',
    });

    this.showSuccessMessage('Filtros limpiados');
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(
      formValue.search?.trim() ||
      formValue.location?.length > 0 ||
      formValue.minPrice ||
      formValue.maxPrice ||
      formValue.propertyType
    );
  }

  confirmDelete(property: Property): void {
    const dialogData: ConfirmDeleteDialogData = {
      title: 'Eliminar Propiedad',
      message: `¿Estás seguro de que deseas eliminar la propiedad "${property.title}"?`,
      // subMessage: 'Esta acción no se puede deshacer.',
      // itemName: property.title,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteProperty(property.id);
      }
    });
  }

  deleteProperty(id: string): void {
    this.loading = true;

    this.propertyService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allProperties = this.allProperties.filter((p) => p.id !== id);
          this.properties = this.properties.filter((p) => p.id !== id);
          this.applyFilters();
          this.showSuccessMessage('Propiedad eliminada exitosamente');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          this.showErrorMessage('Error al eliminar la propiedad');
          this.loading = false;
        },
      });
  }

  exportProperties(): void {
    try {
      const dataToExport = this.filteredProperties.map((property) => ({
        ID: property.id,
        Título: property.title,

        Precio: property.price,
        Ubicación: property.location,
        Tipo: property.propertyType,
        // 'Fecha de creación': property.createdAt,
        // Destacada: property.featured ? 'Sí' : 'No',
      }));

      const csvContent = this.convertToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `propiedades_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      this.showSuccessMessage('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error exporting properties:', error);
      this.showErrorMessage('Error al exportar las propiedades');
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === 'string'
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  trackByProperty(index: number, property: Property): string {
    return property.id;
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
