export interface Property {
  id: string;
  title: string;
  imageUrl: string;
  location: string; // Ej: 'CIUDAD DEL RÍO | Medellín'
  price: number;
  area: number; // m2
  bedrooms: number;
  bathrooms: number;
  parking: number;
  propertyType?: string;
  featured?: boolean; // Indica si es un inmueble destacado
}
