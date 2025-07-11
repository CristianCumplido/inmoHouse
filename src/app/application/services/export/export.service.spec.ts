import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { ReportsService } from '../reports/reports.service';
import { of } from 'rxjs';

describe('ExportService (Jest)', () => {
  let service: ExportService;
  let mockReportsService: jest.Mocked<ReportsService>;

  beforeEach(() => {
    mockReportsService = {
      exportAnalyticsData: jest.fn(),
      exportPropertyReport: jest.fn(),
      exportSalesReport: jest.fn(),
    } as unknown as jest.Mocked<ReportsService>;

    TestBed.configureTestingModule({
      providers: [
        ExportService,
        { provide: ReportsService, useValue: mockReportsService },
      ],
    });

    service = TestBed.inject(ExportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should export CSV content correctly', () => {
    // Arrange
    const data = [
      { name: 'Juan', age: 30 },
      { name: 'Ana', age: 25 },
    ];
    const spy = jest
      .spyOn<any, any>(service as any, 'downloadFile')
      .mockImplementation();

    // Act
    service.exportToCSV(data, 'test-file');

    // Assert
    expect(spy).toHaveBeenCalled();
    const csvCalledWith = spy.mock.calls[0][0];
    expect(csvCalledWith).toContain('name,age');
    expect(csvCalledWith).toContain('Juan');
    expect(csvCalledWith).toContain('Ana');
  });

  test('should call downloadBlob when exporting analytics to PDF', () => {
    // Arrange
    const mockBlob = new Blob(['test']);
    const downloadSpy = jest
      .spyOn<any, any>(service as any, 'downloadBlob')
      .mockImplementation();
    mockReportsService.exportAnalyticsData.mockReturnValue(of(mockBlob));

    // Act
    service.exportAnalyticsToPDF();

    // Assert
    expect(mockReportsService.exportAnalyticsData).toHaveBeenCalledWith('pdf');
    expect(downloadSpy).toHaveBeenCalled();
  });

  test('should call downloadBlob when exporting analytics to Excel', () => {
    // Arrange
    const mockBlob = new Blob(['excel']);
    const downloadSpy = jest
      .spyOn<any, any>(service as any, 'downloadBlob')
      .mockImplementation();
    mockReportsService.exportAnalyticsData.mockReturnValue(of(mockBlob));

    // Act
    service.exportAnalyticsToExcel();

    // Assert
    expect(mockReportsService.exportAnalyticsData).toHaveBeenCalledWith(
      'excel'
    );
    expect(downloadSpy).toHaveBeenCalled();
  });

  test('should export property report correctly', () => {
    // Arrange
    const blob = new Blob(['property']);
    const downloadSpy = jest
      .spyOn<any, any>(service as any, 'downloadBlob')
      .mockImplementation();
    mockReportsService.exportPropertyReport.mockReturnValue(of(blob));

    // Act
    service.exportPropertyReport('123', 'pdf');

    // Assert
    expect(mockReportsService.exportPropertyReport).toHaveBeenCalledWith(
      '123',
      'pdf'
    );
    expect(downloadSpy).toHaveBeenCalled();
  });

  test('should export sales report correctly', () => {
    // Arrange
    const blob = new Blob(['sales']);
    const downloadSpy = jest
      .spyOn<any, any>(service as any, 'downloadBlob')
      .mockImplementation();
    mockReportsService.exportSalesReport.mockReturnValue(of(blob));

    // Act
    service.exportSalesReport('2024-Q1', 'excel');

    // Assert
    expect(mockReportsService.exportSalesReport).toHaveBeenCalledWith(
      '2024-Q1',
      'excel'
    );
    expect(downloadSpy).toHaveBeenCalled();
  });

  test('should export chart as PNG image', () => {
    // Arrange
    const mockClick = jest.fn();
    const mockCanvas = {
      toDataURL: jest.fn(() => 'data:image/png;base64,fakeImageData'),
    };
    const mockChartInstance = { canvas: mockCanvas };
    document.createElement = jest.fn(() => ({ click: mockClick })) as any;

    // Act
    service.exportChart('chart-name', mockChartInstance);

    // Assert
    expect(mockCanvas.toDataURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  test('should export table to Excel', () => {
    // Arrange
    const tableData = [{ col1: 'val1', col2: 'val2' }];
    const spy = jest
      .spyOn<any, any>(service as any, 'downloadBlob')
      .mockImplementation();

    // Act
    service.exportTableToExcel(tableData, 'report');

    // Assert
    expect(spy).toHaveBeenCalled();
  });

  test('should generate comprehensive JSON report', (done) => {
    // Arrange
    const spy = jest
      .spyOn<any, any>(service as any, 'downloadFile')
      .mockImplementation();

    // Act
    service.generateComprehensiveReport();

    // Assert async
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      const args = spy.mock.calls[0];
      expect(args[2]).toBe('application/json');
      done();
    }, 2100);
  });
});
