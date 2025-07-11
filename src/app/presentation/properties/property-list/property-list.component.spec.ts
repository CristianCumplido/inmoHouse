import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { PropertyListComponent } from './property-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { PropertyService } from '../../../application/services/property/property.service';
import { RoleService } from '../../../application/services/role/role.service';
import { Property } from 'src/app/core/models/property.model';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { NO_ERRORS_SCHEMA } from '@angular/core';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Casa 1',
    imageUrl: 'https://example.com/casa1.jpg',
    location: 'Bogotá',
    price: 1000000,
    area: 120,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    propertyType: 'casa',
    featured: false,
  },
  {
    id: '2',
    title: 'Apartamento 2',
    imageUrl: 'https://example.com/apto2.jpg',
    location: 'Medellín',
    price: 1500000,
    area: 85,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    propertyType: 'apartamento',
    featured: true,
  },
];
describe('PropertyListComponent', () => {
  let component: PropertyListComponent;
  let fixture: ComponentFixture<PropertyListComponent>;
  let mockPropertyService: any;
  let mockRoleService: any;
  let mockSnackBar: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockPropertyService = {
      getAll: jest.fn().mockReturnValue(of(mockProperties)),
      delete: jest.fn().mockReturnValue(of({})),
      filterProperties: jest.fn().mockImplementation((list, filters) => list),
    };

    mockRoleService = { isAdmin: jest.fn().mockReturnValue(true) };
    mockSnackBar = { open: jest.fn() };
    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    };

    await TestBed.configureTestingModule({
      declarations: [PropertyListComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatFormFieldModule,
        MatInputModule, // CRUCIAL: Necesario para que MatFormField funcione
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
      ],
      providers: [
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load properties on init', () => {
    expect(mockPropertyService.getAll).toHaveBeenCalled();
    expect(component.allProperties.length).toBeGreaterThan(0);
  });

  it('should apply filters correctly', () => {
    component.applyFilters();
    expect(mockPropertyService.filterProperties).toHaveBeenCalled();
  });

  it('should delete property when confirmed', () => {
    component.deleteProperty('1');
    expect(mockPropertyService.delete).toHaveBeenCalledWith('1');
  });

  it('should show success message after deletion', fakeAsync(() => {
    component.deleteProperty('1');
    tick();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Propiedad eliminada exitosamente',
      'Cerrar',
      expect.anything()
    );
  }));

  it('should show error message on property loading error', () => {
    mockPropertyService.getAll.mockReturnValueOnce(
      throwError(() => new Error('Error'))
    );
    component.loadProperties();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error al cargar las propiedades',
      'Cerrar',
      expect.anything()
    );
  });

  it('should call dialog when confirmDelete is invoked', () => {
    const property = mockProperties[0];
    component.confirmDelete(property);
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
