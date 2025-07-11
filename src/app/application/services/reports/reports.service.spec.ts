import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  ReportsService,
  AnalyticsData,
  PropertyReport,
  UserReport,
  SalesReport,
  ReportsResponse,
} from './reports.service';
import { of } from 'rxjs';

describe('ReportsService', () => {
  let service: ReportsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportsService],
    });

    service = TestBed.inject(ReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAnalyticsData', () => {
    it('should return analytics data with correct structure', (done) => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      // Act
      service.getAnalyticsData(startDate, endDate).subscribe((response) => {
        // Assert
        expect(response).toBeDefined();
        expect(response.analytics).toBeDefined();
        expect(response.analytics.totalProperties).toBe(1247);
        expect(response.analytics.totalUsers).toBe(3856);
        expect(response.analytics.totalRevenue).toBe(15750000000);
        expect(response.analytics.avgPrice).toBe(450000000);
        expect(response.analytics.mostPopularLocation).toBe('Medellín');
        expect(response.propertiesTypeData).toHaveLength(4);
        expect(response.topProperties).toHaveLength(5);
        expect(response.recentActivities).toHaveLength(5);
        done();
      });
    });

    it('should return analytics data without date parameters', (done) => {
      // Arrange - no parameters

      // Act
      service.getAnalyticsData().subscribe((response) => {
        // Assert
        expect(response).toBeDefined();
        expect(response.analytics.propertiesGrowth).toBe(12.5);
        expect(response.analytics.usersGrowth).toBe(8.3);
        expect(response.analytics.revenueGrowth).toBe(15.7);
        done();
      });
    });

    it('should return property types data with correct structure', (done) => {
      // Arrange

      // Act
      service.getAnalyticsData().subscribe((response) => {
        // Assert
        expect(response.propertiesTypeData[0]).toEqual({
          label: 'Apartamentos',
          value: 45,
          color: '#1976d2',
        });
        expect(response.propertiesTypeData[1]).toEqual({
          label: 'Casas',
          value: 30,
          color: '#388e3c',
        });
        done();
      });
    });
  });

  describe('getPropertyReports', () => {
    it('should return property reports with correct structure', (done) => {
      // Arrange
      const filters = { location: 'Medellín', propertyType: 'apartamento' };

      // Act
      service.getPropertyReports(filters).subscribe((properties) => {
        // Assert
        expect(properties).toBeDefined();
        expect(properties).toHaveLength(5);
        expect(properties[0].id).toBe('1');
        expect(properties[0].title).toBe('Apartamento Moderno Centro');
        expect(properties[0].location).toBe('Medellín');
        expect(properties[0].price).toBe(350000000);
        expect(properties[0].status).toBe('active');
        done();
      });
    });

    it('should return properties without filters', (done) => {
      // Arrange - no filters

      // Act
      service.getPropertyReports().subscribe((properties) => {
        // Assert
        expect(properties).toBeDefined();
        expect(properties.length).toBeGreaterThan(0);
        expect(properties[0]).toHaveProperty('id');
        expect(properties[0]).toHaveProperty('title');
        expect(properties[0]).toHaveProperty('location');
        expect(properties[0]).toHaveProperty('price');
        done();
      });
    });

    it('should return property with calculated price per m2', (done) => {
      // Arrange

      // Act
      service.getPropertyReports().subscribe((properties) => {
        // Assert
        const property = properties[0];
        expect(property.pricePerM2).toBe(4117647);
        expect(property.area).toBe(85);
        expect(Math.floor(property.price / property.area)).toBe(
          Math.floor(property.pricePerM2)
        );
        done();
      });
    });
  });

  describe('getPropertyPerformance', () => {
    it('should return property performance data', (done) => {
      // Arrange
      const propertyId = '123';

      // Act
      service.getPropertyPerformance(propertyId).subscribe((performance) => {
        // Assert
        expect(performance).toBeDefined();
        expect(performance.viewsData).toBeDefined();
        expect(performance.contactsData).toBeDefined();
        expect(performance.priceHistory).toBeDefined();
        expect(performance.demographics).toBeDefined();
        expect(performance.viewsData.labels).toHaveLength(6);
        expect(performance.viewsData.data).toHaveLength(6);
        done();
      });
    });

    it('should return demographics data with correct structure', (done) => {
      // Arrange
      const propertyId = '456';

      // Act
      service.getPropertyPerformance(propertyId).subscribe((performance) => {
        // Assert
        expect(performance.demographics.ageGroups).toHaveLength(4);
        expect(performance.demographics.interests).toHaveLength(3);
        expect(performance.demographics.ageGroups[0]).toEqual({
          range: '25-35',
          percentage: 35,
        });
        done();
      });
    });
  });

  describe('getUserReports', () => {
    it('should return user reports with correct structure', (done) => {
      // Arrange
      const filters = { role: 'buyer', status: 'active' };

      // Act
      service.getUserReports(filters).subscribe((users) => {
        // Assert
        expect(users).toBeDefined();
        expect(users).toHaveLength(5);
        expect(users[0].id).toBe('1');
        expect(users[0].name).toBe('Carlos Rodríguez');
        expect(users[0].email).toBe('carlos@email.com');
        expect(users[0].role).toBe('buyer');
        expect(users[0].status).toBe('active');
        done();
      });
    });

    it('should return users with different roles', (done) => {
      // Arrange

      // Act
      service.getUserReports().subscribe((users) => {
        // Assert
        const roles = users.map((user) => user.role);
        expect(roles).toContain('buyer');
        expect(roles).toContain('agent');
        expect(roles).toContain('seller');
        done();
      });
    });

    it('should return users with valid dates', (done) => {
      // Arrange

      // Act
      service.getUserReports().subscribe((users) => {
        // Assert
        users.forEach((user) => {
          expect(user.registrationDate).toBeInstanceOf(Date);
          expect(user.lastLogin).toBeInstanceOf(Date);
        });
        done();
      });
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity data', (done) => {
      // Arrange
      const userId = '123';

      // Act
      service.getUserActivity(userId).subscribe((activity) => {
        // Assert
        expect(activity).toBeDefined();
        expect(activity.loginFrequency).toBeDefined();
        expect(activity.searchPatterns).toBeDefined();
        expect(activity.favoriteLocations).toBeDefined();
        expect(activity.loginFrequency.labels).toHaveLength(7);
        expect(activity.searchPatterns).toHaveLength(5);
        done();
      });
    });

    it('should return search patterns ordered by count', (done) => {
      // Arrange
      const userId = '456';

      // Act
      service.getUserActivity(userId).subscribe((activity) => {
        // Assert
        const counts = activity.searchPatterns.map(
          (pattern: any) => pattern.count
        );
        expect(counts[0]).toBeGreaterThanOrEqual(counts[1]);
        expect(counts[1]).toBeGreaterThanOrEqual(counts[2]);
        done();
      });
    });
  });

  describe('getSalesReports', () => {
    it('should return sales reports with correct structure', (done) => {
      // Arrange
      const filters = { location: 'Medellín', propertyType: 'casa' };

      // Act
      service.getSalesReports(filters).subscribe((sales) => {
        // Assert
        expect(sales).toBeDefined();
        expect(sales).toHaveLength(5);
        expect(sales[0].id).toBe('1');
        expect(sales[0].propertyTitle).toBe('Apartamento Vista Mar');
        expect(sales[0].salePrice).toBe(320000000);
        expect(sales[0].originalPrice).toBe(350000000);
        expect(sales[0].discount).toBe(8.6);
        done();
      });
    });

    it('should calculate discount correctly', (done) => {
      // Arrange

      // Act
      service.getSalesReports().subscribe((sales) => {
        // Assert
        sales.forEach((sale) => {
          const expectedDiscount =
            ((sale.originalPrice - sale.salePrice) / sale.originalPrice) * 100;
          expect(Math.abs(sale.discount - expectedDiscount)).toBeLessThan(0.1);
        });
        done();
      });
    });

    it('should return sales with valid dates', (done) => {
      // Arrange

      // Act
      service.getSalesReports().subscribe((sales) => {
        // Assert
        sales.forEach((sale) => {
          expect(sale.saleDate).toBeInstanceOf(Date);
          expect(sale.daysToSell).toBeGreaterThan(0);
        });
        done();
      });
    });
  });

  describe('getSalesMetrics', () => {
    it('should return sales metrics for given period', (done) => {
      // Arrange
      const period = '2024-Q1';

      // Act
      service.getSalesMetrics(period).subscribe((metrics) => {
        // Assert
        expect(metrics).toBeDefined();
        expect(metrics.totalSales).toBe(15);
        expect(metrics.totalRevenue).toBe(7500000000);
        expect(metrics.avgSalePrice).toBe(500000000);
        expect(metrics.avgDaysToSell).toBe(38);
        expect(metrics.conversionRate).toBe(2.8);
        done();
      });
    });

    it('should return sales by month data', (done) => {
      // Arrange
      const period = '2024';

      // Act
      service.getSalesMetrics(period).subscribe((metrics) => {
        // Assert
        expect(metrics.salesByMonth.labels).toHaveLength(6);
        expect(metrics.salesByMonth.data).toHaveLength(6);
        expect(metrics.revenueByMonth.labels).toHaveLength(6);
        expect(metrics.revenueByMonth.data).toHaveLength(6);
        done();
      });
    });

    it('should return top performing agents', (done) => {
      // Arrange
      const period = '2024';

      // Act
      service.getSalesMetrics(period).subscribe((metrics) => {
        // Assert
        expect(metrics.topPerformingAgents).toHaveLength(5);
        expect(metrics.topPerformingAgents[0].name).toBe('María González');
        expect(metrics.topPerformingAgents[0].sales).toBe(5);
        expect(metrics.topPerformingAgents[0].revenue).toBe(2500000000);
        done();
      });
    });
  });

  describe('getMarketTrends', () => {
    it('should return market trends data', (done) => {
      // Arrange

      // Act
      service.getMarketTrends().subscribe((trends) => {
        // Assert
        expect(trends).toBeDefined();
        expect(trends.priceIndex).toBeDefined();
        expect(trends.inventoryLevels).toBeDefined();
        expect(trends.demandIndicators).toBeDefined();
        expect(trends.competitorAnalysis).toBeDefined();
        done();
      });
    });

    it('should return price index with quarterly data', (done) => {
      // Arrange

      // Act
      service.getMarketTrends().subscribe((trends) => {
        // Assert
        expect(trends.priceIndex.labels).toHaveLength(5);
        expect(trends.priceIndex.data).toEqual([100, 102, 105, 108, 112]);
        done();
      });
    });

    it('should return competitor analysis', (done) => {
      // Arrange

      // Act
      service.getMarketTrends().subscribe((trends) => {
        // Assert
        expect(trends.competitorAnalysis).toHaveLength(5);
        const totalMarketShare = trends.competitorAnalysis.reduce(
          (sum: number, comp: any) => sum + comp.marketShare,
          0
        );
        expect(totalMarketShare).toBe(100);
        done();
      });
    });
  });

  describe('getPriceComparison', () => {
    it('should return price comparison data', (done) => {
      // Arrange
      const location = 'Medellín';
      const propertyType = 'apartamento';

      // Act
      service
        .getPriceComparison(location, propertyType)
        .subscribe((comparison) => {
          // Assert
          expect(comparison).toBeDefined();
          expect(comparison.currentAvgPrice).toBe(450000000);
          expect(comparison.marketAvgPrice).toBe(480000000);
          expect(comparison.priceRange).toBeDefined();
          expect(comparison.historicalComparison).toBeDefined();
          expect(comparison.priceFactors).toBeDefined();
          done();
        });
    });

    it('should return price range with quartiles', (done) => {
      // Arrange
      const location = 'Bogotá';
      const propertyType = 'casa';

      // Act
      service
        .getPriceComparison(location, propertyType)
        .subscribe((comparison) => {
          // Assert
          expect(comparison.priceRange.min).toBe(280000000);
          expect(comparison.priceRange.max).toBe(850000000);
          expect(comparison.priceRange.q1).toBe(350000000);
          expect(comparison.priceRange.median).toBe(450000000);
          expect(comparison.priceRange.q3).toBe(620000000);
          done();
        });
    });

    it('should return price factors with impact levels', (done) => {
      // Arrange
      const location = 'Cali';
      const propertyType = 'local';

      // Act
      service
        .getPriceComparison(location, propertyType)
        .subscribe((comparison) => {
          // Assert
          expect(comparison.priceFactors).toHaveLength(4);
          const totalPercentage = comparison.priceFactors.reduce(
            (sum: number, factor: any) => sum + factor.percentage,
            0
          );
          expect(totalPercentage).toBe(100);
          done();
        });
    });
  });

  describe('exportAnalyticsData', () => {
    it('should export analytics data as PDF', (done) => {
      // Arrange
      const format = 'pdf';

      // Act
      service.exportAnalyticsData(format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/octet-stream');
        done();
      });
    });

    it('should export analytics data as Excel', (done) => {
      // Arrange
      const format = 'excel';

      // Act
      service.exportAnalyticsData(format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });

    it('should export analytics data as CSV', (done) => {
      // Arrange
      const format = 'csv';

      // Act
      service.exportAnalyticsData(format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });
  });

  describe('exportPropertyReport', () => {
    it('should export property report as PDF', (done) => {
      // Arrange
      const propertyId = '123';
      const format = 'pdf';

      // Act
      service.exportPropertyReport(propertyId, format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });

    it('should export property report as Excel', (done) => {
      // Arrange
      const propertyId = '456';
      const format = 'excel';

      // Act
      service.exportPropertyReport(propertyId, format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });
  });

  describe('exportSalesReport', () => {
    it('should export sales report with period and format', (done) => {
      // Arrange
      const period = '2024-Q1';
      const format = 'pdf';

      // Act
      service.exportSalesReport(period, format).subscribe((blob) => {
        // Assert
        expect(blob).toBeInstanceOf(Blob);
        done();
      });
    });
  });

  describe('getLocationAnalytics', () => {
    it('should return location analytics data', (done) => {
      // Arrange

      // Act
      service.getLocationAnalytics().subscribe((locationData) => {
        // Assert
        expect(locationData).toBeDefined();
        expect(locationData.topLocations).toBeDefined();
        expect(locationData.priceHeatmap).toBeDefined();
        expect(locationData.topLocations).toHaveLength(5);
        expect(locationData.priceHeatmap).toHaveLength(4);
        done();
      });
    });

    it('should return top locations ordered by properties count', (done) => {
      // Arrange

      // Act
      service.getLocationAnalytics().subscribe((locationData) => {
        // Assert
        const propertyCounts = locationData.topLocations.map(
          (loc: any) => loc.properties
        );
        expect(propertyCounts[0]).toBeGreaterThanOrEqual(propertyCounts[1]);
        expect(propertyCounts[1]).toBeGreaterThanOrEqual(propertyCounts[2]);
        done();
      });
    });

    it('should return price heatmap with density levels', (done) => {
      // Arrange

      // Act
      service.getLocationAnalytics().subscribe((locationData) => {
        // Assert
        const densityLevels = locationData.priceHeatmap.map(
          (area: any) => area.density
        );
        expect(densityLevels).toContain('high');
        expect(densityLevels).toContain('medium');
        expect(densityLevels).toContain('low');
        done();
      });
    });
  });

  describe('getTimeSeriesData', () => {
    it('should return time series data for given metric and period', (done) => {
      // Arrange
      const metric = 'price';
      const period = '6months';

      // Act
      service.getTimeSeriesData(metric, period).subscribe((timeSeriesData) => {
        // Assert
        expect(timeSeriesData).toBeDefined();
        expect(timeSeriesData.labels).toHaveLength(6);
        expect(timeSeriesData.datasets).toHaveLength(2);
        expect(timeSeriesData.datasets[0].label).toBe('Precio Promedio');
        expect(timeSeriesData.datasets[1].label).toBe('Volumen de Ventas');
        done();
      });
    });

    it('should return datasets with correct structure', (done) => {
      // Arrange
      const metric = 'volume';
      const period = '1year';

      // Act
      service.getTimeSeriesData(metric, period).subscribe((timeSeriesData) => {
        // Assert
        timeSeriesData.datasets.forEach((dataset: any) => {
          expect(dataset.data).toHaveLength(6);
          expect(dataset.borderColor).toBeDefined();
          expect(dataset.backgroundColor).toBeDefined();
        });
        done();
      });
    });
  });

  describe('Service Integration Tests', () => {
    it('should handle multiple concurrent requests', (done) => {
      // Arrange
      let completedRequests = 0;
      const totalRequests = 3;

      // Act
      service.getAnalyticsData().subscribe(() => {
        completedRequests++;
        if (completedRequests === totalRequests) done();
      });

      service.getPropertyReports().subscribe(() => {
        completedRequests++;
        if (completedRequests === totalRequests) done();
      });

      service.getUserReports().subscribe(() => {
        completedRequests++;
        if (completedRequests === totalRequests) done();
      });
    });

    it('should return consistent data structure across methods', (done) => {
      // Arrange

      // Act & Assert
      service.getAnalyticsData().subscribe((analyticsData) => {
        expect(analyticsData.topProperties[0]).toHaveProperty('id');
        expect(analyticsData.topProperties[0]).toHaveProperty('price');

        service.getPropertyReports().subscribe((propertyReports) => {
          expect(propertyReports[0]).toHaveProperty('id');
          expect(propertyReports[0]).toHaveProperty('price');

          // Verify price format consistency
          expect(typeof analyticsData.topProperties[0].price).toBe('number');
          expect(typeof propertyReports[0].price).toBe('number');
          done();
        });
      });
    });

    it('should handle service errors gracefully', (done) => {
      // Arrange
      const originalMethod = service['getMockAnalyticsData'];
      service['getMockAnalyticsData'] = jest.fn().mockImplementation(() => {
        throw new Error('Mock error');
      });

      // Act & Assert
      try {
        service.getAnalyticsData().subscribe(
          () => {},
          (error) => {
            expect(error).toBeDefined();
            service['getMockAnalyticsData'] = originalMethod;
            done();
          }
        );
      } catch (error) {
        expect(error).toBeDefined();
        service['getMockAnalyticsData'] = originalMethod;
        done();
      }
    });
  });
});
