// profile-edit.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileEditComponent } from './profile-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/application/services/user/user.service';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { of, throwError } from 'rxjs';

// Mocks
const mockRouter = {
  navigate: jest.fn(),
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: jest.fn().mockReturnValue('123'),
    },
  },
};

const mockSnackBar = {
  open: jest.fn(),
};

const mockUserService = {
  getProfile: jest.fn(),
};

const mockAuthService = {
  getUser: jest.fn().mockReturnValue({ id: 'user123' }),
};

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileEditComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    // Asegura que SIEMPRE haya un mock por defecto
    mockUserService.getProfile.mockReturnValue(of({ data: {} }));

    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('debería cargar los datos del usuario correctamente', () => {
      // Arrange
      const userData = {
        data: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          profileImage: 'img.jpg',
          socialLinks: {},
        },
      };
      mockUserService.getProfile.mockReturnValue(of(userData));

      // Act
      component.ngOnInit();

      // Assert
      expect(mockUserService.getProfile).toHaveBeenCalledWith('user123');
      expect(component.user?.name).toBe('Test User');
      expect(component.currentImageUrl).toBe('img.jpg');
    });

    it('debería mostrar error si falla la carga del perfil', () => {
      // Arrange
      mockUserService.getProfile.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );

      // Act
      component.ngOnInit();

      // Assert
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar el perfil',
        'Cerrar',
        expect.any(Object)
      );
    });

    it('debería redireccionar si el ID del usuario no existe', () => {
      // Arrange
      mockAuthService.getUser.mockReturnValue(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });
  });

  describe('onCancel()', () => {
    it('debería navegar al perfil', () => {
      // Act
      component.onCancel();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });
  });

  describe('onImageSelected()', () => {
    it('debería actualizar la imagen seleccionada', () => {
      // Arrange
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;

      // Act
      component.onImageSelected(event);

      // Assert
      expect(component.selectedFile).toBe(file);
    });
  });
});
