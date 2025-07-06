import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Property } from '../../../core/models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyApiService {
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
  getAll() {
    return of(this.mockProperties);
  }

  getById(id: string) {
    const found = this.mockProperties.find((p) => p.id === id);
    return of(found!);
  }

  create(property: Property) {
    property.id = crypto.randomUUID();
    this.mockProperties.push(property);
    return of(property);
  }

  update(id: string, property: Property) {
    const idx = this.mockProperties.findIndex((p) => p.id === id);
    this.mockProperties[idx] = { ...property, id };
    return of(this.mockProperties[idx]);
  }

  delete(id: string) {
    this.mockProperties = this.mockProperties.filter((p) => p.id !== id);
    return of();
  }
}
