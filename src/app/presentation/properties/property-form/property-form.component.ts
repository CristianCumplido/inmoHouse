import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { PropertyService } from 'src/app/application/services/property/property.service';
import { Property } from 'src/app/core/models/property.model';

interface PropertyType {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
})
export class PropertyFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private propertyService = inject(PropertyService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEdit = false;
  propertyId: string | null = null;
  loading = false;
  imageLoading = false;

  // Opciones para los selectores
  propertyTypes: PropertyType[] = [
    { value: 'casa', label: 'Casa', icon: 'home' },
    { value: 'apartamento', label: 'Apartamento', icon: 'apartment' },
    { value: 'local', label: 'Local comercial', icon: 'store' },
    { value: 'oficina', label: 'Oficina', icon: 'business' },
    { value: 'lote', label: 'Lote', icon: 'landscape' },
    { value: 'bodega', label: 'Bodega', icon: 'warehouse' },
    { value: 'penthouse', label: 'Penthouse', icon: 'domain' },
    { value: 'duplex', label: 'Duplex', icon: 'home_work' },
    { value: 'estudio', label: 'Estudio', icon: 'single_bed' },
  ];

  locations: string[] = [
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

  bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  bathroomOptions = [1, 2, 3, 4, 5, 6];
  parkingOptions = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.propertyId;

    if (this.isEdit) {
      this.loadProperty();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      price: ['', [Validators.required, Validators.min(1)]],
      location: ['', [Validators.required]],
      imageUrl: [
        '',
        [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)],
      ],
      area: ['', [Validators.required, Validators.min(1)]],
      bedrooms: ['', [Validators.required]],
      bathrooms: ['', [Validators.required]],
      parking: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
    });
  }

  private loadProperty(): void {
    if (!this.propertyId) return;

    this.loading = true;

    this.propertyService
      .getById(this.propertyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (property) => {
          this.form.patchValue({
            title: property.title,
            price: property.price,
            location: property.location,
            imageUrl: property.imageUrl,
            area: property.area,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            parking: property.parking,
            propertyType: property.propertyType || '',
          });

          // Marcar el formulario como pristine después de cargar los datos
          this.form.markAsPristine();
          this.form.markAsUntouched();

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading property:', error);
          this.showErrorMessage('Error al cargar la propiedad');
          this.loading = false;
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      this.showErrorMessage('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    const formValue = this.form.value;

    const propertyData: Omit<Property, 'id'> = {
      title: formValue.title?.trim() || '',
      imageUrl: formValue.imageUrl?.trim() || this.getDefaultImageUrl(),
      location: formValue.location || '',
      price: Number(formValue.price) || 0,
      area: Number(formValue.area) || 0,
      bedrooms: Number(formValue.bedrooms) || 0,
      bathrooms: Number(formValue.bathrooms) || 0,
      parking: Number(formValue.parking) || 0,
      propertyType: formValue.propertyType || undefined,
    };

    if (this.isEdit && this.propertyId) {
      this.updateProperty(propertyData);
    } else {
      this.createProperty(propertyData);
    }
  }

  private createProperty(propertyData: Omit<Property, 'id'>): void {
    const newProperty: Property = {
      ...propertyData,
      id: this.generateId(),
    };

    this.propertyService
      .create(newProperty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage('Propiedad creada exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          console.error('Error creating property:', error);
          this.showErrorMessage('Error al crear la propiedad');
          this.loading = false;
        },
      });
  }

  private updateProperty(propertyData: Omit<Property, 'id'>): void {
    if (!this.propertyId) return;

    const updatedProperty: Property = {
      ...propertyData,
      id: this.propertyId,
    };

    this.propertyService
      .update(this.propertyId, updatedProperty)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccessMessage('Propiedad actualizada exitosamente');
          this.navigateToList();
        },
        error: (error) => {
          console.error('Error updating property:', error);
          this.showErrorMessage('Error al actualizar la propiedad');
          this.loading = false;
        },
      });
  }

  // Métodos de navegación
  goBack(): void {
    this.location.back();
  }

  private navigateToList(): void {
    this.router.navigate(['/dashboard']);
  }

  // Métodos de utilidad
  resetForm(): void {
    this.form.reset();
    this.initializeFormDefaults();
    this.showInfoMessage('Formulario reiniciado');
  }

  private initializeFormDefaults(): void {
    this.form.patchValue({
      price: '',
      area: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultImageUrl(): string {
    return 'assets/images/default-property.jpg';
  }

  // Métodos para cálculos y vista previa
  showMetrics(): boolean {
    const price = this.form.get('price')?.value;
    const area = this.form.get('area')?.value;
    return !!(price && area && price > 0 && area > 0);
  }

  getPricePerSquareMeter(): number {
    const price = this.form.get('price')?.value || 0;
    const area = this.form.get('area')?.value || 0;
    return area > 0 ? price / area : 0;
  }

  getAreaPerBedroom(): number {
    const area = this.form.get('area')?.value || 0;
    const bedrooms = this.form.get('bedrooms')?.value || 0;
    return bedrooms > 0 ? area / bedrooms : 0;
  }

  // Métodos para manejo de imágenes
  onImageLoad(): void {
    this.imageLoading = false;
  }

  onImageError(event: any): void {
    this.imageLoading = false;
    event.target.src = this.getDefaultImageUrl();
    this.showErrorMessage(
      'Error al cargar la imagen. Se usará la imagen por defecto.'
    );
  }

  // Métodos de validación personalizados
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  hasValidationErrors(): boolean {
    // Solo mostrar errores si el usuario ha interactuado con el formulario
    // y hay campos inválidos
    return this.form.invalid;
  }

  // Método mejorado para verificar si el formulario es válido para envío
  canSubmit(): boolean {
    return this.form.valid && !this.loading;
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required'])
      return `${this.getFieldLabel(fieldName)} es requerido`;
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor debe ser mayor a ${errors['min'].min}`;
    if (errors['pattern']) return 'Formato no válido';

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Título',
      description: 'Descripción',
      price: 'Precio',
      location: 'Ubicación',
      imageUrl: 'URL de imagen',
      area: 'Área',
      bedrooms: 'Habitaciones',
      bathrooms: 'Baños',
      parking: 'Parqueaderos',
      propertyType: 'Tipo de propiedad',
    };
    return labels[fieldName] || fieldName;
  }

  // Métodos para mensajes
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  // Método para autocompletar ubicación (implementación futura)
  onLocationInput(event: any): void {
    const value = event.target.value;
    if (value && value.length > 2) {
      // Aquí puedes implementar autocompletado de ubicaciones
      // usando servicios como Google Places API
      console.log('Searching locations for:', value);
    }
  }

  // Método para validar imagen URL
  validateImageUrl(): void {
    const imageUrl = this.form.get('imageUrl')?.value;
    if (imageUrl) {
      this.imageLoading = true;
      // La validación ocurre automáticamente con onLoad y onError
    }
  }

  // Método para obtener sugerencias de precios (implementación futura)
  suggestPrice(): void {
    const location = this.form.get('location')?.value;
    const area = this.form.get('area')?.value;
    const propertyType = this.form.get('propertyType')?.value;

    if (location && area && propertyType) {
      // Aquí puedes implementar sugerencias de precio basadas en datos del mercado
      console.log('Suggesting price for:', { location, area, propertyType });
      this.showInfoMessage(
        'Funcionalidad de sugerencia de precios en desarrollo'
      );
    }
  }
}
