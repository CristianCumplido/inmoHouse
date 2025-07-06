import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AnalyticsData {
  totalProperties: number;
  totalUsers: number;
  totalRevenue: number;
  avgPrice: number;
  propertiesGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
  priceChange: number;
  avgDaysOnMarket: number;
  conversionRate: number;
  mostPopularLocation: string;
  avgPricePerM2: number;
}

export interface PropertyTypeData {
  label: string;
  value: number;
  color: string;
}

export interface TopProperty {
  id: string;
  title: string;
  location: string;
  views: number;
  viewsTrend: number;
  price: number;
}

export interface Activity {
  type: 'create' | 'update' | 'delete' | 'view' | 'contact';
  description: string;
  timestamp: Date;
  actionable: boolean;
}

export interface PropertyReport {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  price: number;
  area: number;
  pricePerM2: number;
  daysOnMarket: number;
  views: number;
  contacts: number;
  status: 'active' | 'sold' | 'rented' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserReport {
  id: string;
  name: string;
  email: string;
  role: string;
  registrationDate: Date;
  lastLogin: Date;
  propertiesViewed: number;
  contactsMade: number;
  status: 'active' | 'inactive';
}

export interface SalesReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  salePrice: number;
  originalPrice: number;
  discount: number;
  saleDate: Date;
  daysToSell: number;
  agentCommission: number;
  location: string;
  propertyType: string;
}

export interface ReportsResponse {
  analytics: AnalyticsData;
  propertiesTypeData: PropertyTypeData[];
  topProperties: TopProperty[];
  recentActivities: Activity[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private baseUrl = '/api/reports'; // Adjust according to your API

  constructor(private http: HttpClient) {}

  // Analytics Data
  getAnalyticsData(
    startDate?: Date,
    endDate?: Date
  ): Observable<ReportsResponse> {
    // In a real application, you would make HTTP requests to your backend
    // For now, we'll return mock data
    return this.getMockAnalyticsData().pipe(delay(1000));
  }

  // Property Reports
  getPropertyReports(filters?: any): Observable<PropertyReport[]> {
    return this.getMockPropertyReports().pipe(delay(800));
  }

  getPropertyPerformance(propertyId: string): Observable<any> {
    return this.getMockPropertyPerformance(propertyId).pipe(delay(600));
  }

  // User Reports
  getUserReports(filters?: any): Observable<UserReport[]> {
    return this.getMockUserReports().pipe(delay(800));
  }

  getUserActivity(userId: string): Observable<any> {
    return this.getMockUserActivity(userId).pipe(delay(600));
  }

  // Sales Reports
  getSalesReports(filters?: any): Observable<SalesReport[]> {
    return this.getMockSalesReports().pipe(delay(800));
  }

  getSalesMetrics(period: string): Observable<any> {
    return this.getMockSalesMetrics(period).pipe(delay(600));
  }

  // Market Analysis
  getMarketTrends(): Observable<any> {
    return this.getMockMarketTrends().pipe(delay(1000));
  }

  getPriceComparison(location: string, propertyType: string): Observable<any> {
    return this.getMockPriceComparison(location, propertyType).pipe(delay(800));
  }

  // Mock Data Methods
  private getMockAnalyticsData(): Observable<ReportsResponse> {
    const mockData: ReportsResponse = {
      analytics: {
        totalProperties: 1247,
        totalUsers: 3856,
        totalRevenue: 15750000000,
        avgPrice: 450000000,
        propertiesGrowth: 12.5,
        usersGrowth: 8.3,
        revenueGrowth: 15.7,
        priceChange: 3.2,
        avgDaysOnMarket: 45,
        conversionRate: 2.8,
        mostPopularLocation: 'Medellín',
        avgPricePerM2: 3200000,
      },
      propertiesTypeData: [
        { label: 'Apartamentos', value: 45, color: '#1976d2' },
        { label: 'Casas', value: 30, color: '#388e3c' },
        { label: 'Locales', value: 15, color: '#f57c00' },
        { label: 'Oficinas', value: 10, color: '#7b1fa2' },
      ],
      topProperties: [
        {
          id: '1',
          title: 'Penthouse Zona Rosa',
          location: 'Bogotá',
          views: 1250,
          viewsTrend: 15,
          price: 850000000,
        },
        {
          id: '2',
          title: 'Casa Campestre',
          location: 'Medellín',
          views: 980,
          viewsTrend: 8,
          price: 650000000,
        },
        {
          id: '3',
          title: 'Apartamento Centro',
          location: 'Cali',
          views: 875,
          viewsTrend: 12,
          price: 320000000,
        },
        {
          id: '4',
          title: 'Local Comercial',
          location: 'Barranquilla',
          views: 720,
          viewsTrend: 5,
          price: 280000000,
        },
        {
          id: '5',
          title: 'Oficina Moderna',
          location: 'Cartagena',
          views: 650,
          viewsTrend: 20,
          price: 420000000,
        },
      ],
      recentActivities: [
        {
          type: 'create',
          description: 'Nueva propiedad agregada: "Apartamento Moderno"',
          timestamp: new Date(),
          actionable: true,
        },
        {
          type: 'contact',
          description: 'Contacto recibido para Casa en Envigado',
          timestamp: new Date(Date.now() - 3600000),
          actionable: true,
        },
        {
          type: 'update',
          description: 'Precio actualizado para Penthouse Centro',
          timestamp: new Date(Date.now() - 7200000),
          actionable: false,
        },
        {
          type: 'view',
          description: '50 nuevas vistas en propiedades de Medellín',
          timestamp: new Date(Date.now() - 10800000),
          actionable: false,
        },
        {
          type: 'create',
          description: 'Nuevo usuario registrado: Juan Pérez',
          timestamp: new Date(Date.now() - 14400000),
          actionable: false,
        },
      ],
    };

    return of(mockData);
  }

  private getMockPropertyReports(): Observable<PropertyReport[]> {
    const properties: PropertyReport[] = [
      {
        id: '1',
        title: 'Apartamento Moderno Centro',
        location: 'Medellín',
        propertyType: 'apartamento',
        price: 350000000,
        area: 85,
        pricePerM2: 4117647,
        daysOnMarket: 23,
        views: 245,
        contacts: 12,
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: '2',
        title: 'Casa Familiar Envigado',
        location: 'Envigado',
        propertyType: 'casa',
        price: 650000000,
        area: 180,
        pricePerM2: 3611111,
        daysOnMarket: 45,
        views: 180,
        contacts: 8,
        status: 'active',
        createdAt: new Date('2023-12-10'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '3',
        title: 'Local Comercial Poblado',
        location: 'Medellín',
        propertyType: 'local',
        price: 280000000,
        area: 120,
        pricePerM2: 2333333,
        daysOnMarket: 67,
        views: 95,
        contacts: 5,
        status: 'active',
        createdAt: new Date('2023-11-05'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: '4',
        title: 'Oficina Ejecutiva El Poblado',
        location: 'Medellín',
        propertyType: 'oficina',
        price: 420000000,
        area: 95,
        pricePerM2: 4421052,
        daysOnMarket: 30,
        views: 156,
        contacts: 9,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-25'),
      },
      {
        id: '5',
        title: 'Penthouse Vista Panorámica',
        location: 'Bogotá',
        propertyType: 'apartamento',
        price: 850000000,
        area: 200,
        pricePerM2: 4250000,
        daysOnMarket: 15,
        views: 320,
        contacts: 18,
        status: 'active',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-01'),
      },
    ];

    return of(properties);
  }

  private getMockPropertyPerformance(propertyId: string): Observable<any> {
    const performance = {
      viewsData: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [45, 52, 38, 67, 73, 89],
      },
      contactsData: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [2, 3, 1, 4, 5, 7],
      },
      priceHistory: [
        { date: '2024-01-01', price: 350000000 },
        { date: '2024-02-01', price: 340000000 },
        { date: '2024-03-01', price: 335000000 },
      ],
      demographics: {
        ageGroups: [
          { range: '25-35', percentage: 35 },
          { range: '36-45', percentage: 40 },
          { range: '46-55', percentage: 20 },
          { range: '56+', percentage: 5 },
        ],
        interests: [
          { category: 'Familia', percentage: 45 },
          { category: 'Inversión', percentage: 30 },
          { category: 'Primera vivienda', percentage: 25 },
        ],
      },
    };

    return of(performance);
  }

  private getMockUserReports(): Observable<UserReport[]> {
    const users: UserReport[] = [
      {
        id: '1',
        name: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        role: 'buyer',
        registrationDate: new Date('2024-01-15'),
        lastLogin: new Date('2024-02-01'),
        propertiesViewed: 25,
        contactsMade: 5,
        status: 'active',
      },
      {
        id: '2',
        name: 'María González',
        email: 'maria@email.com',
        role: 'agent',
        registrationDate: new Date('2023-06-20'),
        lastLogin: new Date('2024-02-02'),
        propertiesViewed: 150,
        contactsMade: 45,
        status: 'active',
      },
      {
        id: '3',
        name: 'Juan Pérez',
        email: 'juan@email.com',
        role: 'buyer',
        registrationDate: new Date('2024-01-30'),
        lastLogin: new Date('2024-01-31'),
        propertiesViewed: 8,
        contactsMade: 2,
        status: 'active',
      },
      {
        id: '4',
        name: 'Ana Martínez',
        email: 'ana@email.com',
        role: 'seller',
        registrationDate: new Date('2023-11-10'),
        lastLogin: new Date('2024-01-28'),
        propertiesViewed: 35,
        contactsMade: 12,
        status: 'active',
      },
      {
        id: '5',
        name: 'Roberto Silva',
        email: 'roberto@email.com',
        role: 'buyer',
        registrationDate: new Date('2023-09-15'),
        lastLogin: new Date('2024-01-15'),
        propertiesViewed: 42,
        contactsMade: 8,
        status: 'inactive',
      },
    ];

    return of(users);
  }

  private getMockUserActivity(userId: string): Observable<any> {
    const activity = {
      loginFrequency: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [5, 8, 6, 9, 7, 3, 2],
      },
      searchPatterns: [
        { term: 'apartamento medellín', count: 15 },
        { term: 'casa envigado', count: 12 },
        { term: 'local comercial', count: 8 },
        { term: 'oficina poblado', count: 6 },
        { term: 'penthouse bogotá', count: 4 },
      ],
      favoriteLocations: [
        { location: 'Medellín', searches: 45 },
        { location: 'Envigado', searches: 23 },
        { location: 'Sabaneta', searches: 18 },
        { location: 'Bogotá', searches: 15 },
        { location: 'Cali', searches: 12 },
      ],
    };

    return of(activity);
  }

  private getMockSalesReports(): Observable<SalesReport[]> {
    const sales: SalesReport[] = [
      {
        id: '1',
        propertyId: 'p1',
        propertyTitle: 'Apartamento Vista Mar',
        buyerName: 'Ana Martínez',
        salePrice: 320000000,
        originalPrice: 350000000,
        discount: 8.6,
        saleDate: new Date('2024-01-25'),
        daysToSell: 42,
        agentCommission: 9600000,
        location: 'Cartagena',
        propertyType: 'apartamento',
      },
      {
        id: '2',
        propertyId: 'p2',
        propertyTitle: 'Casa Familiar Laureles',
        buyerName: 'Roberto Silva',
        salePrice: 580000000,
        originalPrice: 600000000,
        discount: 3.3,
        saleDate: new Date('2024-01-20'),
        daysToSell: 35,
        agentCommission: 17400000,
        location: 'Medellín',
        propertyType: 'casa',
      },
      {
        id: '3',
        propertyId: 'p3',
        propertyTitle: 'Local Comercial Centro',
        buyerName: 'Inversiones SAS',
        salePrice: 280000000,
        originalPrice: 300000000,
        discount: 6.7,
        saleDate: new Date('2024-01-15'),
        daysToSell: 28,
        agentCommission: 8400000,
        location: 'Bogotá',
        propertyType: 'local',
      },
      {
        id: '4',
        propertyId: 'p4',
        propertyTitle: 'Oficina Moderna Zona Rosa',
        buyerName: 'Tech Corp',
        salePrice: 450000000,
        originalPrice: 450000000,
        discount: 0,
        saleDate: new Date('2024-01-10'),
        daysToSell: 22,
        agentCommission: 13500000,
        location: 'Bogotá',
        propertyType: 'oficina',
      },
      {
        id: '5',
        propertyId: 'p5',
        propertyTitle: 'Casa Campestre La Calera',
        buyerName: 'Familia López',
        salePrice: 750000000,
        originalPrice: 800000000,
        discount: 6.25,
        saleDate: new Date('2024-01-05'),
        daysToSell: 55,
        agentCommission: 22500000,
        location: 'La Calera',
        propertyType: 'casa',
      },
    ];

    return of(sales);
  }

  private getMockSalesMetrics(period: string): Observable<any> {
    const metrics = {
      totalSales: 15,
      totalRevenue: 7500000000,
      avgSalePrice: 500000000,
      avgDaysToSell: 38,
      conversionRate: 2.8,
      salesByMonth: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [2, 3, 1, 4, 3, 2],
      },
      revenueByMonth: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [
          1000000000, 1500000000, 500000000, 2000000000, 1500000000, 1000000000,
        ],
      },
      topPerformingAgents: [
        { name: 'María González', sales: 5, revenue: 2500000000 },
        { name: 'Carlos López', sales: 4, revenue: 2000000000 },
        { name: 'Ana Rodríguez', sales: 3, revenue: 1500000000 },
        { name: 'Roberto Martínez', sales: 2, revenue: 1000000000 },
        { name: 'Laura Silva', sales: 1, revenue: 500000000 },
      ],
    };

    return of(metrics);
  }

  private getMockMarketTrends(): Observable<any> {
    const trends = {
      priceIndex: {
        labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1'],
        data: [100, 102, 105, 108, 112],
      },
      inventoryLevels: {
        labels: ['Apartamentos', 'Casas', 'Locales', 'Oficinas'],
        data: [1200, 800, 350, 150],
      },
      demandIndicators: {
        searchVolume: 125.5,
        inquiryRate: 8.3,
        tourRequests: 15.7,
      },
      competitorAnalysis: [
        { company: 'Inmobiliaria A', marketShare: 25, avgPrice: 480000000 },
        { company: 'Inmobiliaria B', marketShare: 20, avgPrice: 520000000 },
        { company: 'Nosotros', marketShare: 15, avgPrice: 450000000 },
        { company: 'Inmobiliaria C', marketShare: 12, avgPrice: 410000000 },
        { company: 'Otros', marketShare: 28, avgPrice: 460000000 },
      ],
    };

    return of(trends);
  }

  private getMockPriceComparison(
    location: string,
    propertyType: string
  ): Observable<any> {
    const comparison = {
      currentAvgPrice: 450000000,
      marketAvgPrice: 480000000,
      priceRange: {
        min: 280000000,
        max: 850000000,
        q1: 350000000,
        median: 450000000,
        q3: 620000000,
      },
      historicalComparison: {
        labels: [
          '6m ago',
          '5m ago',
          '4m ago',
          '3m ago',
          '2m ago',
          '1m ago',
          'Now',
        ],
        ourPrices: [420, 430, 435, 440, 445, 448, 450],
        marketPrices: [450, 460, 465, 470, 475, 478, 480],
      },
      priceFactors: [
        { factor: 'Ubicación', impact: 'Alto', percentage: 40 },
        { factor: 'Área', impact: 'Alto', percentage: 30 },
        { factor: 'Antigüedad', impact: 'Medio', percentage: 15 },
        { factor: 'Amenidades', impact: 'Medio', percentage: 15 },
      ],
    };

    return of(comparison);
  }

  // Export Methods
  exportAnalyticsData(format: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    // Mock implementation - in real app, call backend
    return new Observable((observer) => {
      setTimeout(() => {
        const mockBlob = new Blob(['Mock export data'], {
          type: 'application/octet-stream',
        });
        observer.next(mockBlob);
        observer.complete();
      }, 1000);
    });
  }

  exportPropertyReport(
    propertyId: string,
    format: 'pdf' | 'excel'
  ): Observable<Blob> {
    return new Observable((observer) => {
      setTimeout(() => {
        const mockBlob = new Blob(['Mock property report'], {
          type: 'application/octet-stream',
        });
        observer.next(mockBlob);
        observer.complete();
      }, 1000);
    });
  }

  exportSalesReport(period: string, format: 'pdf' | 'excel'): Observable<Blob> {
    return new Observable((observer) => {
      setTimeout(() => {
        const mockBlob = new Blob(['Mock sales report'], {
          type: 'application/octet-stream',
        });
        observer.next(mockBlob);
        observer.complete();
      }, 1000);
    });
  }

  // Real-time updates (WebSocket simulation)
  getRealtimeUpdates(): Observable<any> {
    return new Observable((observer) => {
      const interval = setInterval(() => {
        const randomUpdate = {
          type: Math.random() > 0.5 ? 'new_view' : 'new_contact',
          data: {
            propertyId: Math.floor(Math.random() * 100).toString(),
            timestamp: new Date(),
          },
        };
        observer.next(randomUpdate);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    });
  }

  // Advanced analytics methods
  getLocationAnalytics(): Observable<any> {
    const locationData = {
      topLocations: [
        {
          name: 'Medellín',
          properties: 420,
          avgPrice: 380000000,
          growth: 12.5,
        },
        { name: 'Bogotá', properties: 350, avgPrice: 520000000, growth: 8.3 },
        { name: 'Cali', properties: 180, avgPrice: 290000000, growth: 15.2 },
        {
          name: 'Barranquilla',
          properties: 120,
          avgPrice: 240000000,
          growth: 6.8,
        },
        {
          name: 'Cartagena',
          properties: 90,
          avgPrice: 450000000,
          growth: 18.9,
        },
      ],
      priceHeatmap: [
        { location: 'El Poblado', avgPrice: 580000000, density: 'high' },
        { location: 'Laureles', avgPrice: 420000000, density: 'medium' },
        { location: 'Envigado', avgPrice: 380000000, density: 'medium' },
        { location: 'Sabaneta', avgPrice: 320000000, density: 'low' },
      ],
    };

    return of(locationData).pipe(delay(600));
  }

  getTimeSeriesData(metric: string, period: string): Observable<any> {
    const timeSeriesData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Precio Promedio',
          data: [
            420000000, 435000000, 445000000, 440000000, 450000000, 465000000,
          ],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
        },
        {
          label: 'Volumen de Ventas',
          data: [25, 32, 18, 45, 38, 42],
          borderColor: '#388e3c',
          backgroundColor: 'rgba(56, 142, 60, 0.1)',
        },
      ],
    };

    return of(timeSeriesData).pipe(delay(500));
  }
}
