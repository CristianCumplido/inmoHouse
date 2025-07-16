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

  loadProperty(): void {
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
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const propertyId = this.route.snapshot.paramMap.get('id');
    this.isFavorite = favorites.includes(propertyId);
  }

  goBack(): void {
    this.location.back();
  }

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
    return new Date();
  }

  hasDescription(): boolean {
    return false;
  }

  onImageError(event: any): void {
    event.target.src = this.defaultImage;
  }

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

    const message = `Hola, estoy interesado en la propiedad "${this.property.title}" ubicada en ${this.property.location}. ¿Podrías darme más información?`;
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  }

  scheduleVisit(): void {
    if (!this.property) return;

    this.router.navigate(['/appointments/new']);
  }

  openMortgageCalculator(): void {
    if (!this.property) return;

    this.showInfoMessage('Calculadora de hipoteca en desarrollo');
  }

  retry(): void {
    this.loadProperty();
  }

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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

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

  getPropertyTypeClass(): string {
    if (!this.property?.propertyType) return 'default';
    return this.property.propertyType.toLowerCase().replace(/\s+/g, '-');
  }

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

  loadSimilarProperties(): void {
    if (!this.property) return;

    console.log('Loading similar properties...');
  }

  reportIssue(): void {
    if (!this.property) return;

    const issueData = {
      propertyId: this.property.id,
      propertyTitle: this.property.title,
      reportedAt: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Property issue reported:', issueData);
    this.showSuccessMessage('Reporte enviado. Gracias por tu colaboración.');
  }
}
