import { Injectable } from '@angular/core';
import { Property } from '../../../core/models/property.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of } from 'rxjs';
import { environment } from 'src/app/environment/envoronment';

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.BASE_URL_API;
  private Properties: Property[] = [];
  private mockProperties: Property[] = [
    {
      id: '1',
      title: 'Casa moderna en Ciudad del Río',
      imageUrl:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      location: 'CIUDAD DEL RÍO | Medellín',
      price: 890000000,
      area: 180,
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
    },
    {
      id: '2',
      title: 'Apartamento de lujo en El Poblado',
      imageUrl:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      location: 'EL POBLADO | Medellín',
      price: 650000000,
      area: 120,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
    },
    {
      id: '3',
      title: 'Casa familiar en Envigado',
      imageUrl:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      location: 'ENVIGADO | Medellín',
      price: 420000000,
      area: 200,
      bedrooms: 4,
      bathrooms: 3,
      parking: 2,
    },
    {
      id: '4',
      title: 'Apartamento moderno en Laureles',
      imageUrl:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      location: 'LAURELES | Medellín',
      price: 380000000,
      area: 85,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
    },
    {
      id: '5',
      title: 'Penthouse en Sabaneta',
      imageUrl:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      location: 'SABANETA | Medellín',
      price: 1200000000,
      area: 220,
      bedrooms: 3,
      bathrooms: 4,
      parking: 3,
    },
    {
      id: '6',
      title: 'Casa campestre en Las Palmas',
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      location: 'LAS PALMAS | Medellín',
      price: 750000000,
      area: 350,
      bedrooms: 5,
      bathrooms: 4,
      parking: 4,
    },
    {
      id: '7',
      title: 'Apartamento ejecutivo en Belén',
      imageUrl:
        'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&h=600&fit=crop',
      location: 'BELÉN | Medellín',
      price: 290000000,
      area: 75,
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
    },
    {
      id: '8',
      title: 'Villa moderna en La Estrella',
      imageUrl:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      location: 'LA ESTRELLA | Medellín',
      price: 950000000,
      area: 280,
      bedrooms: 4,
      bathrooms: 5,
      parking: 3,
    },
  ];
  getAll(): Observable<Property[]> {
    return this.http
      .get<{ data: Property[] }>(`${this.baseUrl}/properties`)
      .pipe(
        tap((res) => {
          this.Properties = res.data; // ✅ asignación aquí
        }),
        map((res) => res.data)
      );
  }

  getById(id: string) {
    const found = this.Properties.find((p) => p.id === id);
    return of(found!);
  }

  create(property: Property) {
    // property.id = crypto.randomUUID();
    // this.mockProperties.push(property);
    return this.http.post<Property>(`${this.baseUrl}/properties`, property);
  }

  update(id: string, property: Property): Observable<Property> {
    return this.http
      .put<{ data: Property }>(`${this.baseUrl}/properties/${id}`, property)
      .pipe(
        tap((res) => {
          // Opcional: actualizas el array local si quieres
          const idx = this.Properties.findIndex((p) => p.id === id);
          if (idx !== -1) {
            this.Properties[idx] = res.data;
          }
        }),
        map((res) => res.data)
      );
  }

  delete(id: string): Observable<any> {
    return this.http
      .delete<{ data: Property }>(`${this.baseUrl}/properties/${id}`)
      .pipe(
        tap((res) => {
          // Opcional: actualizas el array local si quieres
          const idx = this.Properties.findIndex((p) => p.id === id);
          if (idx !== -1) {
            this.Properties[idx] = res.data;
          }
        }),
        map((res) => res.data)
      );
  }
}
