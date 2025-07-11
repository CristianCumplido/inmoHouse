import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';

// Mocks
const mockAuthService = {
  logout: jest.fn(),
  isLoggedIn: jest.fn(),
  currentUser$: of({ name: 'Test User', role: 'Administrator' }),
};

const mockRoleService = {}; // No se usa directamente en este código

const mockRouter = {
  navigate: jest.fn(),
};

describe('HeaderComponent (Jest)', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    // Arrange
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [MatMenuModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Llama a ngOnInit
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create the component', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  test('should subscribe and assign current user on ngOnInit', () => {
    // Assert
    expect(component.user).toEqual({
      name: 'Test User',
      role: 'Administrator',
    });
  });

  test('should call authService.logout and navigate to /login on logout', () => {
    // Act
    component.logout();

    // Assert
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  test('should redirect to /admin if user role is Administrator', () => {
    // Arrange
    component.user = { role: 'Administrator' };

    // Act
    component.redirectToHome();

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  test('should redirect to /agent if user role is Agente', () => {
    // Arrange
    component.user = { role: 'Agente' };

    // Act
    component.redirectToHome();

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/agent']);
  });

  test('should redirect to /client if user role is Cliente', () => {
    // Arrange
    component.user = { role: 'Cliente' };

    // Act
    component.redirectToHome();

    // Assert
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/client']);
  });
});
