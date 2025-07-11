import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Mock data
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.ADMIN,
    phone: '+1234567890',
  };

  const mockLoginResponse = {
    data: {
      user: mockUser,
      token: 'mock-jwt-token',
    },
  };

  const mockRegisterData = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: UserRole.AGENT,
    phone: '+0987654321',
  };

  const mockAzureToken = 'mock-azure-token';

  beforeEach(() => {
    // Arrange - Setup del módulo de testing
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Cleanup - Verificar que no hay requests pendientes
    httpMock.verify();
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      // Arrange & Act - El servicio ya está creado en beforeEach

      // Assert
      expect(service).toBeTruthy();
    });

    it('should initialize with null currentUser', () => {
      // Arrange & Act - El servicio ya está inicializado

      // Assert
      expect(service.getUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
    });

    it('should have currentUser$ observable', (done) => {
      // Arrange & Act
      service.currentUser$.subscribe((user) => {
        // Assert
        expect(user).toBeNull();
        done();
      });
    });
  });

  describe('login()', () => {
    it('should login successfully and update currentUser', () => {
      // Arrange
      const loginData = { email: 'john@example.com', password: 'password123' };
      let actualResponse: any;

      // Act
      service.login(loginData).subscribe((response) => {
        actualResponse = response;
      });

      // Assert
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);

      req.flush(mockLoginResponse);

      expect(actualResponse).toEqual(mockLoginResponse);
      expect(service.getUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('should handle login error', () => {
      // Arrange
      const loginData = {
        email: 'john@example.com',
        password: 'wrong-password',
      };
      const errorResponse = { status: 401, statusText: 'Unauthorized' };
      let actualError: any;

      // Act
      service.login(loginData).subscribe({
        next: () => {},
        error: (error) => {
          actualError = error;
        },
      });

      // Assert
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush('Invalid credentials', errorResponse);

      expect(actualError).toBeDefined();
      expect(service.getUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
    });

    it('should emit currentUser$ when login succeeds', (done) => {
      // Arrange
      const loginData = { email: 'john@example.com', password: 'password123' };
      let emittedUser: User | null = null;

      // Act
      service.currentUser$.subscribe((user) => {
        emittedUser = user;
        if (user) {
          // Assert
          expect(emittedUser).toEqual(mockUser);
          done();
        }
      });

      service.login(loginData).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);
    });
  });

  describe('logout()', () => {
    it('should logout and clear currentUser', () => {
      // Arrange - Primero hacer login
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      expect(service.isLoggedIn()).toBeTruthy();

      // Act
      service.logout();

      // Assert
      expect(service.getUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
    });

    it('should emit null on currentUser$ when logout', (done) => {
      // Arrange - Primero hacer login
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      let emissionCount = 0;
      service.currentUser$.subscribe((user) => {
        emissionCount++;
        if (emissionCount === 2) {
          // Segunda emisión después del logout
          // Assert
          expect(user).toBeNull();
          done();
        }
      });

      // Act
      service.logout();
    });
  });

  describe('isLoggedIn()', () => {
    it('should return true when user is logged in', () => {
      // Arrange - Simular usuario logueado
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      // Act
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBeTruthy();
    });

    it('should return false when user is not logged in', () => {
      // Arrange - Estado inicial (sin usuario)

      // Act
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBeFalsy();
    });

    it('should return false after logout', () => {
      // Arrange - Hacer login primero
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      // Act
      service.logout();
      const result = service.isLoggedIn();

      // Assert
      expect(result).toBeFalsy();
    });
  });

  describe('getUser()', () => {
    it('should return current user when logged in', () => {
      // Arrange - Hacer login
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      // Act
      const result = service.getUser();

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when not logged in', () => {
      // Arrange - Estado inicial (sin usuario)

      // Act
      const result = service.getUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('loginWithAzure()', () => {
    it('should login with Azure token successfully', () => {
      // Arrange
      let actualResponse: any;
      const expectedRequestBody = { azureToken: mockAzureToken };

      // Act
      service.loginWithAzure(mockAzureToken).subscribe((response) => {
        actualResponse = response;
      });

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/azure-login'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedRequestBody);

      req.flush(mockLoginResponse);

      expect(actualResponse).toEqual(mockLoginResponse);
      expect(service.getUser()).toEqual(mockUser);
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('should save user to localStorage on Azure login', () => {
      // Arrange
      const localStorageSetItemSpy = jest.spyOn(localStorage, 'setItem');

      // Act
      service.loginWithAzure(mockAzureToken).subscribe();

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/azure-login'
      );
      req.flush(mockLoginResponse);

      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'currentUser',
        JSON.stringify(mockLoginResponse)
      );
    });

    it('should handle Azure login error', () => {
      // Arrange
      const errorResponse = { status: 401, statusText: 'Invalid Azure Token' };
      let actualError: any;

      // Act
      service.loginWithAzure(mockAzureToken).subscribe({
        next: () => {},
        error: (error) => {
          actualError = error;
        },
      });

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/azure-login'
      );
      req.flush('Invalid Azure token', errorResponse);

      expect(actualError).toBeDefined();
      expect(service.getUser()).toBeNull();
      expect(service.isLoggedIn()).toBeFalsy();
    });

    it('should emit currentUser$ on Azure login success', (done) => {
      // Arrange
      let emittedUser: User | null = null;

      // Act
      service.currentUser$.subscribe((user) => {
        emittedUser = user;
        if (user) {
          // Assert
          expect(emittedUser).toEqual(mockUser);
          done();
        }
      });

      service.loginWithAzure(mockAzureToken).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/azure-login'
      );
      req.flush(mockLoginResponse);
    });
  });

  describe('register()', () => {
    it('should register user successfully', () => {
      // Arrange
      const mockRegisterResponse = {
        data: {
          user: {
            ...mockRegisterData,
            id: '2',
          },
        },
      };
      let actualResponse: any;

      // Act
      service.register(mockRegisterData).subscribe((response) => {
        actualResponse = response;
      });

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/register'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterData);

      req.flush(mockRegisterResponse);

      expect(actualResponse).toEqual(mockRegisterResponse);
    });

    it('should handle registration error', () => {
      // Arrange
      const errorResponse = { status: 400, statusText: 'Bad Request' };
      let actualError: any;

      // Act
      service.register(mockRegisterData).subscribe({
        next: () => {},
        error: (error) => {
          actualError = error;
        },
      });

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/register'
      );
      req.flush('Email already exists', errorResponse);

      expect(actualError).toBeDefined();
    });

    it('should send correct data structure for registration', () => {
      // Arrange
      const customRegisterData = {
        name: 'Custom User',
        email: 'custom@example.com',
        password: 'customPassword123',
        role: UserRole.ADMIN,
        phone: '+1111111111',
      };

      // Act
      service.register(customRegisterData).subscribe();

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/register'
      );
      expect(req.request.body).toEqual(customRegisterData);
      expect(req.request.body.name).toBe('Custom User');
      expect(req.request.body.email).toBe('custom@example.com');
      expect(req.request.body.role).toBe(UserRole.ADMIN);
      expect(req.request.body.phone).toBe('+1111111111');

      req.flush({ data: { user: customRegisterData } });
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle network errors for login', () => {
      // Arrange
      const loginData = { email: 'john@example.com', password: 'password123' };
      let actualError: any;

      // Act
      service.login(loginData).subscribe({
        next: () => {},
        error: (error) => {
          actualError = error;
        },
      });

      // Assert
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.error(new ErrorEvent('Network error'), { status: 0 });

      expect(actualError).toBeDefined();
    });

    it('should handle server errors for Azure login', () => {
      // Arrange
      let actualError: any;

      // Act
      service.loginWithAzure(mockAzureToken).subscribe({
        next: () => {},
        error: (error) => {
          actualError = error;
        },
      });

      // Assert
      const req = httpMock.expectOne(
        'http://localhost:3000/api/v1/auth/azure-login'
      );
      req.error(new ErrorEvent('Server error'), { status: 500 });

      expect(actualError).toBeDefined();
    });
  });

  describe('Observable Behavior', () => {
    it('should maintain observable stream consistency', (done) => {
      // Arrange
      const userStates: (User | null)[] = [];

      // Act
      service.currentUser$.subscribe((user) => {
        userStates.push(user);

        // Assert - Verificar secuencia de estados
        if (userStates.length === 3) {
          expect(userStates[0]).toBeNull(); // Estado inicial
          expect(userStates[1]).toEqual(mockUser); // Después del login
          expect(userStates[2]).toBeNull(); // Después del logout
          done();
        }
      });

      // Simular login
      service
        .login({ email: 'john@example.com', password: 'password123' })
        .subscribe();
      const req = httpMock.expectOne('http://localhost:3000/api/v1/auth/login');
      req.flush(mockLoginResponse);

      // Simular logout
      service.logout();
    });
  });
});
