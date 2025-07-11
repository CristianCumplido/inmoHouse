import { TestBed } from '@angular/core/testing';
import { ReportsService } from './reports.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ReportsResponse,
  UserReport,
  PropertyReport,
  SalesReport,
} from './reports.service';
import { take } from 'rxjs/operators';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportsService],
    });
    service = TestBed.inject(ReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Mock Data Methods', () => {
    it('should return analytics data', (done) => {
      // Arrange

      // Act
      service
        .getAnalyticsData()
        .pipe(take(1))
        .subscribe((res: ReportsResponse) => {
          // Assert
          expect(res).toBeTruthy();
          expect(res.analytics).toHaveProperty('totalProperties');
          expect(res.propertiesTypeData.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should return property reports', (done) => {
      // Act
      service
        .getPropertyReports()
        .pipe(take(1))
        .subscribe((properties: PropertyReport[]) => {
          // Assert
          expect(properties.length).toBeGreaterThan(0);
          expect(properties[0]).toHaveProperty('title');
          done();
        });
    });

    it('should return user reports', (done) => {
      service
        .getUserReports()
        .pipe(take(1))
        .subscribe((users: UserReport[]) => {
          expect(users.length).toBeGreaterThan(0);
          expect(users[0].email).toContain('@');
          done();
        });
    });

    it('should return property performance for a given property', (done) => {
      service
        .getPropertyPerformance('1')
        .pipe(take(1))
        .subscribe((performance) => {
          expect(performance).toHaveProperty('viewsData');
          expect(performance.viewsData.data.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should return user activity for a given user', (done) => {
      service
        .getUserActivity('1')
        .pipe(take(1))
        .subscribe((activity) => {
          expect(activity).toHaveProperty('loginFrequency');
          expect(activity.searchPatterns.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should return sales reports', (done) => {
      service
        .getSalesReports()
        .pipe(take(1))
        .subscribe((sales: SalesReport[]) => {
          expect(sales.length).toBeGreaterThan(0);
          expect(sales[0].salePrice).toBeGreaterThan(0);
          done();
        });
    });

    it('should return sales metrics', (done) => {
      service
        .getSalesMetrics('monthly')
        .pipe(take(1))
        .subscribe((metrics) => {
          expect(metrics.totalSales).toBeGreaterThan(0);
          expect(metrics.salesByMonth.labels.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should return market trends', (done) => {
      service
        .getMarketTrends()
        .pipe(take(1))
        .subscribe((trends) => {
          expect(trends).toHaveProperty('priceIndex');
          expect(trends.inventoryLevels.data.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should return price comparison data', (done) => {
      service
        .getPriceComparison('Medellín', 'apartamento')
        .pipe(take(1))
        .subscribe((comparison) => {
          expect(comparison.currentAvgPrice).toBeGreaterThan(0);
          expect(
            comparison.historicalComparison.ourPrices.length
          ).toBeGreaterThan(0);
          done();
        });
    });

    it('should return location analytics', (done) => {
      service
        .getLocationAnalytics()
        .pipe(take(1))
        .subscribe((data) => {
          expect(data.topLocations.length).toBeGreaterThan(0);
          expect(data.priceHeatmap[0].location).toBeTruthy();
          done();
        });
    });

    it('should return time series data', (done) => {
      service
        .getTimeSeriesData('price', 'monthly')
        .pipe(take(1))
        .subscribe((data) => {
          expect(data.labels.length).toBeGreaterThan(0);
          expect(data.datasets[0].data.length).toBeGreaterThan(0);
          done();
        });
    });

    it('should export analytics data as blob', (done) => {
      service
        .exportAnalyticsData('pdf')
        .pipe(take(1))
        .subscribe((blob: Blob) => {
          expect(blob instanceof Blob).toBe(true);
          done();
        });
    });

    it('should export property report as blob', (done) => {
      service
        .exportPropertyReport('1', 'excel')
        .pipe(take(1))
        .subscribe((blob: Blob) => {
          expect(blob instanceof Blob).toBe(true);
          done();
        });
    });

    it('should export sales report as blob', (done) => {
      service
        .exportSalesReport('monthly', 'pdf')
        .pipe(take(1))
        .subscribe((blob: Blob) => {
          expect(blob instanceof Blob).toBe(true);
          done();
        });
    });
  });
});
