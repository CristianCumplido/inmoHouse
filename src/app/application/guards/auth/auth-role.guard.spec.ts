import { authRoleGuard } from './auth-role.guard';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role/role.service';
import { UserRole } from '../../../core/models/roles.enum';

// Mocks
const mockNavigate = jest.fn();
const mockRouter = { navigate: mockNavigate };
const mockRoleService = {
  user: jest.fn(),
};

// Espiar `inject`
jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core');
  return {
    ...actual,
    inject: (token: any) => {
      if (token === RoleService) return mockRoleService;
      if (token === Router) return mockRouter;
      throw new Error('Unknown dependency');
    },
  };
});

describe('authRoleGuard (Jest)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return false and redirect to /login if no user is found', () => {
    // Arrange
    mockRoleService.user.mockReturnValue(null);
    const guardFn = authRoleGuard([UserRole.ADMIN]);

    // Act
    const mockRoute = {} as any; // o ActivatedRouteSnapshot si lo necesitas más detallado
    const mockState = {} as any; // o RouterStateSnapshot
    const result = guardFn(mockRoute, mockState);

    // Assert
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith(['/login']);
  });

  test('should return false and redirect if user has no allowed role', () => {
    // Arrange
    mockRoleService.user.mockReturnValue({ role: UserRole.CLIENT });
    const guardFn = authRoleGuard([UserRole.ADMIN]);

    // Act
    const mockRoute = {} as any; // o ActivatedRouteSnapshot si lo necesitas más detallado
    const mockState = {} as any; // o RouterStateSnapshot
    const result = guardFn(mockRoute, mockState);

    // Assert
    expect(result).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith(['/login']);
  });

  test('should return true if user role is allowed', () => {
    // Arrange
    mockRoleService.user.mockReturnValue({ role: UserRole.ADMIN });
    const guardFn = authRoleGuard([UserRole.ADMIN, UserRole.AGENT]);

    // Act
    const mockRoute = {} as any; // o ActivatedRouteSnapshot si lo necesitas más detallado
    const mockState = {} as any; // o RouterStateSnapshot
    const result = guardFn(mockRoute, mockState);

    // Assert
    expect(result).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
