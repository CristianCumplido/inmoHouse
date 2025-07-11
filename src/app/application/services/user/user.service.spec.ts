import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { UserApiService } from 'src/app/infrastructure/api/user-api/user-api.service';
import { of } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';

describe('UserService (Jest)', () => {
  let service: UserService;
  let mockApi: jest.Mocked<UserApiService>;

  beforeEach(() => {
    mockApi = {
      getAll: jest.fn(),
      getById: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserApiService>;

    TestBed.configureTestingModule({
      providers: [UserService, { provide: UserApiService, useValue: mockApi }],
    });

    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call getAll() from api', () => {
    // Arrange
    const mockUsers = [{ name: 'Juan' }] as User[];
    mockApi.getAll.mockReturnValue(of(mockUsers));

    // Act
    service.getAll().subscribe((users) => {
      // Assert
      expect(users).toEqual(mockUsers);
    });

    expect(mockApi.getAll).toHaveBeenCalled();
  });

  test('should call getById() from api', () => {
    // Arrange
    const userId = 'abc123';
    const mockUser = { id: userId, name: 'Ana' } as User;
    mockApi.getById.mockReturnValue(of(mockUser));

    // Act
    service.getById(userId).subscribe((user) => {
      // Assert
      expect(user).toEqual(mockUser);
    });

    expect(mockApi.getById).toHaveBeenCalledWith(userId);
  });

  test('should call getProfile() from api', () => {
    // Arrange
    const userId = 'abc123';
    const profile = {
      id: '1',
      name: 'Perfil',
      email: 'admin@admin.com',
      role: UserRole.CLIENT,
    };
    mockApi.getProfile.mockReturnValue(of(profile));

    // Act
    service.getProfile(userId).subscribe((res) => {
      // Assert
      expect(res).toEqual(profile);
    });

    expect(mockApi.getProfile).toHaveBeenCalledWith(userId);
  });

  test('should call changePassword() from api', () => {
    // Arrange
    const result = { success: true };
    mockApi.changePassword.mockReturnValue(of(result));

    // Act
    service.changePassword('1', 'old', 'new').subscribe((res) => {
      // Assert
      expect(res).toEqual(result);
    });

    expect(mockApi.changePassword).toHaveBeenCalledWith('1', 'old', 'new');
  });

  test('should call create() from api', () => {
    // Arrange
    const newUser = { id: '10', name: 'New User' } as User;
    mockApi.create.mockReturnValue(of(newUser));

    // Act
    service.create(newUser).subscribe((res) => {
      // Assert
      expect(res).toEqual(newUser);
    });

    expect(mockApi.create).toHaveBeenCalledWith(newUser);
  });

  test('should call update() from api', () => {
    // Arrange
    const user = { id: '5', name: 'Update' } as User;
    mockApi.update.mockReturnValue(of(user));

    // Act
    service.update('5', user).subscribe((res) => {
      // Assert
      expect(res).toEqual(user);
    });

    expect(mockApi.update).toHaveBeenCalledWith('5', user);
  });

  test('should call delete() from api', () => {
    // Arrange
    mockApi.delete.mockReturnValue(of(undefined));

    // Act
    service.delete('8').subscribe((res) => {
      // Assert
      expect(res).toBeUndefined();
    });

    expect(mockApi.delete).toHaveBeenCalledWith('8');
  });

  test('should filter users by role and search term', () => {
    // Arrange
    const users: User[] = [
      {
        id: '1',
        name: 'Juan',
        email: 'juan@example.com',
        role: UserRole.CLIENT,
      },
      { id: '2', name: 'Ana', email: 'ana@admin.com', role: UserRole.ADMIN },
      {
        id: '3',
        name: 'Pedro',
        email: 'pedro@agent.com',
        role: UserRole.AGENT,
      },
    ];

    const filters = { role: UserRole.ADMIN, search: 'ana' };

    // Act
    const result = service.filterUsers(users, filters);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('ana@admin.com');
  });

  test('should return all users if no filters applied', () => {
    // Arrange
    const users: User[] = [
      { id: '1', name: 'User1', email: 'u1@mail.com', role: UserRole.CLIENT },
      { id: '2', name: 'User2', email: 'u2@mail.com', role: UserRole.AGENT },
    ];

    // Act
    const result = service.filterUsers(users, {});

    // Assert
    expect(result).toEqual(users);
  });
});
