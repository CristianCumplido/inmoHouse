export interface Property {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  price: number;
  area: number; // m2
  bedrooms: number;
  bathrooms: number;
  parking: number;
  propertyType?: string;
  featured?: boolean;
}
