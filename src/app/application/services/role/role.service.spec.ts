import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { User } from '../../../core/models/user.model';
import { UserRole } from '../../../core/models/roles.enum';

describe('RoleService', () => {
  let service: RoleService;

  // Mock data
  const mockAdminUser: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const mockAgentUser: User = {
    id: '2',
    name: 'Agent User',
    email: 'agent@test.com',
    role: UserRole.AGENT,
  };

  const mockClientUser: User = {
    id: '3',
    name: 'Client User',
    email: 'client@test.com',
    role: UserRole.CLIENT,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService],
    });
    service = TestBed.inject(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      // Assert
      expect(service).toBeTruthy();
    });

    it('should initialize with null user', () => {
      // Act
      const user = service.user();

      // Assert
      expect(user).toBeNull();
    });

    it('should initialize with null role', () => {
      // Act
      const role = service.role();

      // Assert
      expect(role).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user successfully', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      service.setUser(mockAdminUser);

      // Assert
      expect(service.user()).toEqual(mockAdminUser);
    });

    it('should update user when called multiple times', () => {
      // Arrange
      service.setUser(mockAdminUser);

      // Act
      service.setUser(mockClientUser);

      // Assert
      expect(service.user()).toEqual(mockClientUser);
      expect(service.user()).not.toEqual(mockAdminUser);
    });
  });

  describe('user getter', () => {
    it('should return readonly signal of current user', () => {
      // Arrange
      service.setUser(mockAgentUser);

      // Act
      const user = service.user();

      // Assert
      expect(user).toEqual(mockAgentUser);
    });

    it('should return null when no user is set', () => {
      // Act
      const user = service.user();

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('role getter', () => {
    it('should return user role when user is set', () => {
      // Arrange
      service.setUser(mockAdminUser);

      // Act
      const role = service.role();

      // Assert
      expect(role).toBe(UserRole.ADMIN);
    });

    it('should return null when no user is set', () => {
      // Act
      const role = service.role();

      // Assert
      expect(role).toBeNull();
    });

    it('should return null when user has no role', () => {
      // Arrange
      const userWithoutRole: User = {
        id: '4',
        name: 'User Without Role',
        email: 'norole@test.com',
        role: undefined as any,
      };
      service.setUser(userWithoutRole);

      // Act
      const role = service.role();

      // Assert
      expect(role).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      // Arrange
      service.setUser(mockAdminUser);

      // Act
      const isAdmin = service.isAdmin();

      // Assert
      expect(isAdmin).toBe(true);
    });

    it('should return false when user is not admin', () => {
      // Arrange
      service.setUser(mockAgentUser);

      // Act
      const isAdmin = service.isAdmin();

      // Assert
      expect(isAdmin).toBe(false);
    });

    it('should return false when no user is set', () => {
      // Act
      const isAdmin = service.isAdmin();

      // Assert
      expect(isAdmin).toBe(false);
    });
  });

  describe('isAgent', () => {
    it('should return true when user is agent', () => {
      // Arrange
      service.setUser(mockAgentUser);

      // Act
      const isAgent = service.isAgent();

      // Assert
      expect(isAgent).toBe(true);
    });

    it('should return false when user is not agent', () => {
      // Arrange
      service.setUser(mockAdminUser);

      // Act
      const isAgent = service.isAgent();

      // Assert
      expect(isAgent).toBe(false);
    });

    it('should return false when no user is set', () => {
      // Act
      const isAgent = service.isAgent();

      // Assert
      expect(isAgent).toBe(false);
    });
  });

  describe('isClient', () => {
    it('should return true when user is client', () => {
      // Arrange
      service.setUser(mockClientUser);

      // Act
      const isClient = service.isClient();

      // Assert
      expect(isClient).toBe(true);
    });

    it('should return false when user is not client', () => {
      // Arrange
      service.setUser(mockAdminUser);

      // Act
      const isClient = service.isClient();

      // Assert
      expect(isClient).toBe(false);
    });

    it('should return false when no user is set', () => {
      // Act
      const isClient = service.isClient();

      // Assert
      expect(isClient).toBe(false);
    });
  });

  describe('Role switching scenarios', () => {
    it('should update role checks when user changes', () => {
      // Arrange
      service.setUser(mockAdminUser);
      expect(service.isAdmin()).toBe(true);
      expect(service.isAgent()).toBe(false);
      expect(service.isClient()).toBe(false);

      // Act
      service.setUser(mockAgentUser);

      // Assert
      expect(service.isAdmin()).toBe(false);
      expect(service.isAgent()).toBe(true);
      expect(service.isClient()).toBe(false);
    });

    it('should handle role changes from client to admin', () => {
      // Arrange
      service.setUser(mockClientUser);
      expect(service.isClient()).toBe(true);

      // Act
      service.setUser(mockAdminUser);

      // Assert
      expect(service.isClient()).toBe(false);
      expect(service.isAdmin()).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle user with null role property', () => {
      // Arrange
      const userWithNullRole: User = {
        id: '5',
        name: 'User With Null Role',
        email: 'nullrole@test.com',
        role: null as any,
      };
      service.setUser(userWithNullRole);

      // Act & Assert
      expect(service.role()).toBeNull();
      expect(service.isAdmin()).toBe(false);
      expect(service.isAgent()).toBe(false);
      expect(service.isClient()).toBe(false);
    });

    it('should maintain reactivity when user changes', () => {
      // Arrange
      service.setUser(mockAdminUser);
      const roleSignal = service.role;

      // Act
      service.setUser(mockClientUser);

      // Assert
      expect(roleSignal()).toBe(UserRole.CLIENT);
    });
  });
});
