import { Injectable } from '@angular/core';
import { ReportsService } from './../reports/reports.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private reportsService: ReportsService) {}

  exportChart(chartName: string, chartInstance: any): void {
    if (!chartInstance) {
      return;
    }

    try {
      const canvas = chartInstance.canvas;
      const url = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `${chartName}-${
        new Date().toISOString().split('T')[0]
      }.png`;
      link.href = url;
      link.click();
    } catch (error) {}
  }

  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              if (
                typeof value === 'string' &&
                (value.includes(',') || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',')
        ),
      ].join('\n');

      this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    } catch (error) {}
  }

  exportAnalyticsToPDF(): void {
    this.reportsService.exportAnalyticsData('pdf').subscribe({
      next: (blob: any) => {
        this.downloadBlob(
          blob,
          `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
        );
      },
      error: (error: any) => {},
    });
  }

  exportAnalyticsToExcel(): void {
    this.reportsService.exportAnalyticsData('excel').subscribe({
      next: (blob) => {
        this.downloadBlob(
          blob,
          `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`
        );
      },
      error: (error) => {},
    });
  }

  exportPropertyReport(propertyId: string, format: 'pdf' | 'excel'): void {
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    this.reportsService.exportPropertyReport(propertyId, format).subscribe({
      next: (blob) => {
        this.downloadBlob(
          blob,
          `property-report-${propertyId}-${
            new Date().toISOString().split('T')[0]
          }.${extension}`
        );
      },
      error: (error) => {},
    });
  }

  exportSalesReport(period: string, format: 'pdf' | 'excel'): void {
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    this.reportsService.exportSalesReport(period, format).subscribe({
      next: (blob) => {
        this.downloadBlob(
          blob,
          `sales-report-${period}-${
            new Date().toISOString().split('T')[0]
          }.${extension}`
        );
      },
      error: (error) => {},
    });
  }

  private downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportTableToExcel(
    tableData: any[],
    filename: string,
    sheetName: string = 'Sheet1'
  ): void {
    if (!tableData || tableData.length === 0) {
      return;
    }

    try {
      const headers = Object.keys(tableData[0]);
      const htmlTable = `
        <table>
          <thead>
            <tr>
              ${headers.map((header) => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableData
              .map(
                (row) =>
                  `<tr>
                ${headers
                  .map((header) => `<td>${row[header] || ''}</td>`)
                  .join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;

      const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
      this.downloadBlob(blob, `${filename}.xls`);
    } catch (error) {}
  }

  printReport(elementId: string): void {
    const printContent = document.getElementById(elementId);
    if (!printContent) {
      return;
    }

    const winPrint = window.open(
      '',
      '',
      'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0'
    );

    if (!winPrint) {
      return;
    }

    winPrint.document.write(`
      <html>
        <head>
          <title>Reporte de Inmuebles</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 30px; }
            .kpi-grid { display: flex; justify-content: space-around; margin: 20px 0; }
            .kpi-item { text-align: center; padding: 10px; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #1976d2; }
            .kpi-label { font-size: 12px; color: #666; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Análisis Inmobiliario</h1>
            <p>Generado el: ${new Date().toLocaleDateString('es-CO')}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    winPrint.document.close();
    winPrint.focus();

    setTimeout(() => {
      winPrint.print();
      winPrint.close();
    }, 250);
  }

  generateComprehensiveReport(): void {
    setTimeout(() => {
      const reportData = {
        generatedAt: new Date(),
        summary: 'Reporte completo de análisis inmobiliario',
        sections: [
          'Análisis general',
          'Reporte de propiedades',
          'Análisis de usuarios',
          'Reporte de ventas',
          'Tendencias del mercado',
        ],
      };

      const jsonReport = JSON.stringify(reportData, null, 2);
      this.downloadFile(
        jsonReport,
        `comprehensive-report-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
    }, 2000);
  }

  bulkExport(reportTypes: string[], format: 'pdf' | 'excel' | 'csv'): void {
    reportTypes.forEach((type, index) => {
      setTimeout(() => {
        const mockData = [
          { id: 1, name: `Sample ${type} Data 1`, value: 100 },
          { id: 2, name: `Sample ${type} Data 2`, value: 200 },
        ];

        if (format === 'csv') {
          this.exportToCSV(mockData, `${type}-report`);
        } else {
          this.exportTableToExcel(mockData, `${type}-report`);
        }
      }, index * 1000);
    });
  }

  scheduleExport(config: {
    reportType: string;
    format: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    email: string;
  }): void {}
}
