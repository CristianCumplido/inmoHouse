import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { PropertyService } from 'src/app/application/services/property/property.service';
import { Property } from 'src/app/core/models/property.model';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss'],
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  property: Property | null = null;
  loading = false;
  error: string | null = null;
  isFavorite = false;

  // Imagen por defecto en caso de error
  private defaultImage = 'assets/images/default-property.jpg';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private propertyService: PropertyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProperty();
    this.checkFavoriteStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProperty(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'ID de propiedad no válido';
      return;
    }

    this.loading = true;
    this.error = null;

    this.propertyService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (property) => {
          this.property = property;
          this.loading = false;

          // Actualizar el título de la página
          if (property.title) {
            document.title = `${property.title} - Portal Inmobiliario`;
          }
        },
        error: (error) => {
          console.error('Error loading property:', error);
          this.error = 'No se pudo cargar la información de la propiedad';
          this.loading = false;
          this.showErrorMessage('Error al cargar la propiedad');
        },
      });
  }

  private checkFavoriteStatus(): void {
    // Aquí puedes implementar la lógica para verificar si la propiedad está en favoritos
    // Por ejemplo, consultando un servicio de favoritos o localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const propertyId = this.route.snapshot.paramMap.get('id');
    this.isFavorite = favorites.includes(propertyId);
  }

  // Navegación
  goBack(): void {
    this.location.back();
  }

  // Cálculos de métricas
  getPricePerSquareMeter(): number {
    if (!this.property || !this.property.area || this.property.area === 0) {
      return 0;
    }
    return this.property.price / this.property.area;
  }

  getAreaPerBedroom(): number {
    if (
      !this.property ||
      !this.property.bedrooms ||
      this.property.bedrooms === 0
    ) {
      return 0;
    }
    return this.property.area / this.property.bedrooms;
  }

  getPublishedDate(): Date {
    // Si no tienes campo de fecha de publicación, usa la fecha actual
    // En un caso real, esto vendría del backend
    return new Date();
  }

  hasDescription(): boolean {
    return false;
  }

  // Manejo de imagen
  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

  // Acciones de la propiedad
  shareProperty(): void {
    if (!this.property) return;

    if (navigator.share) {
      navigator
        .share({
          title: this.property.title,
          text: `Mira esta propiedad: ${this.property.title} en ${this.property.location}`,
          url: window.location.href,
        })
        .catch((err) => console.log('Error sharing:', err));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          this.showSuccessMessage('Enlace copiado al portapapeles');
        })
        .catch(() => {
          this.showErrorMessage('No se pudo copiar el enlace');
        });
    }
  }

  addToFavorites(): void {
    if (!this.property) return;

    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (!favorites.includes(this.property.id)) {
        favorites.push(this.property.id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        this.isFavorite = true;
        this.showSuccessMessage('Propiedad agregada a favoritos');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      this.showErrorMessage('Error al agregar a favoritos');
    }
  }

  removeFromFavorites(): void {
    if (!this.property) return;

    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updatedFavorites = favorites.filter(
        (id: string) => id !== this.property!.id
      );
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      this.isFavorite = false;
      this.showSuccessMessage('Propiedad removida de favoritos');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      this.showErrorMessage('Error al remover de favoritos');
    }
  }

  contactAgent(): void {
    if (!this.property) return;

    // Aquí puedes implementar la lógica para contactar al agente
    // Por ejemplo, abrir un modal de contacto o redirigir a WhatsApp
    const message = `Hola, estoy interesado en la propiedad "${this.property.title}" ubicada en ${this.property.location}. ¿Podrías darme más información?`;
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  }

  scheduleVisit(): void {
    if (!this.property) return;

    // Aquí puedes abrir un modal para programar una visita
    // o redirigir a un formulario de contacto
    this.showInfoMessage('Funcionalidad de programar visita en desarrollo');

    // Ejemplo de implementación futura:
    // const dialogRef = this.dialog.open(ScheduleVisitDialogComponent, {
    //   width: '500px',
    //   data: { property: this.property }
    // });
  }

  openMortgageCalculator(): void {
    if (!this.property) return;

    // Aquí puedes abrir un modal con calculadora de hipoteca
    // o redirigir a una página especializada
    this.showInfoMessage('Calculadora de hipoteca en desarrollo');

    // Ejemplo de implementación futura:
    // const dialogRef = this.dialog.open(MortgageCalculatorComponent, {
    //   width: '600px',
    //   data: {
    //     propertyPrice: this.property.price,
    //     propertyTitle: this.property.title
    //   }
    // });
  }

  // Método para reintentar carga en caso de error
  retry(): void {
    this.loadProperty();
  }

  // Métodos de utilidad para mensajes
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

  // Método para formatear números grandes
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Método para obtener el icono según el tipo de propiedad
  getPropertyTypeIcon(): string {
    if (!this.property?.propertyType) return 'home';

    const typeIconMap: { [key: string]: string } = {
      casa: 'home',
      apartamento: 'apartment',
      local: 'store',
      oficina: 'business',
      lote: 'landscape',
      bodega: 'warehouse',
      penthouse: 'domain',
    };

    return typeIconMap[this.property.propertyType.toLowerCase()] || 'home';
  }

  // Método para obtener clase CSS según el tipo de propiedad
  getPropertyTypeClass(): string {
    if (!this.property?.propertyType) return 'default';
    return this.property.propertyType.toLowerCase().replace(/\s+/g, '-');
  }

  // Método para validar si la propiedad tiene todas las características necesarias
  isPropertyComplete(): boolean {
    return !!(
      this.property &&
      this.property.title &&
      this.property.location &&
      this.property.price &&
      this.property.area &&
      this.property.bedrooms !== undefined &&
      this.property.bathrooms !== undefined &&
      this.property.parking !== undefined
    );
  }

  // Método para obtener sugerencias de propiedades similares (para implementación futura)
  loadSimilarProperties(): void {
    if (!this.property) return;

    // Aquí puedes implementar la carga de propiedades similares
    // basándose en ubicación, precio, tipo, etc.
    console.log('Loading similar properties...');
  }

  // Método para reportar problema con la propiedad
  reportIssue(): void {
    if (!this.property) return;

    const issueData = {
      propertyId: this.property.id,
      propertyTitle: this.property.title,
      reportedAt: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Aquí puedes enviar el reporte al backend
    console.log('Property issue reported:', issueData);
    this.showSuccessMessage('Reporte enviado. Gracias por tu colaboración.');
  }
}
