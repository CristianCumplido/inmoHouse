import { Injectable } from '@angular/core';
import { Property } from '../../../core/models/property.model';
import { PropertyApiService } from '../../../infrastructure/api/property-api/property-api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  constructor(private api: PropertyApiService) {}

  getAll(): Observable<Property[]> {
    return this.api.getAll();
  }

  getById(id: string): Observable<Property> {
    return this.api.getById(id);
  }

  create(property: Property): Observable<Property> {
    return this.api.create(property);
  }

  update(id: string, property: Property): Observable<Property> {
    return this.api.update(id, property);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
  filterProperties(
    properties: Property[],
    filters: {
      location?: string[];
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      propertyType?: string;
    }
  ): Property[] {
    return properties.filter((p) => {
      const matchesLocation =
        !filters.location ||
        (Array.isArray(filters.location)
          ? filters.location.some((loc) => p.location.includes(loc))
          : p.location.includes(filters.location));
      const matchesPrice =
        (!filters.minPrice || p.price >= filters.minPrice) &&
        (!filters.maxPrice || p.price <= filters.maxPrice);
      const matchesSearch =
        !filters.search ||
        p.title.toLowerCase().includes(filters.search.toLowerCase());
      return matchesLocation && matchesPrice && matchesSearch;
    });
  }
}
