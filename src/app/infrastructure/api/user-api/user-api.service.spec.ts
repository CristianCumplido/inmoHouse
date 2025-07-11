import { TestBed } from '@angular/core/testing';
import { UserApiService } from './user-api.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';

describe('UserApiService (Jest)', () => {
  let service: UserApiService;
  let httpMock: jest.Mocked<HttpClient>;

  const mockUsers: User[] = [
    { id: '1', name: 'Ana Admin', email: 'ana@inmo.com', role: UserRole.ADMIN },
    {
      id: '2',
      name: 'Carlos Cliente',
      email: 'carlos@inmo.com',
      role: UserRole.CLIENT,
    },
    {
      id: '3',
      name: 'Andrea Agente',
      email: 'andrea@inmo.com',
      role: UserRole.AGENT,
    },
  ];

  beforeEach(() => {
    httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [UserApiService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(UserApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch all users and cache them', (done) => {
    // Arrange
    const response = { data: mockUsers };
    httpMock.get.mockReturnValue(of(response));

    // Act
    service.getAll().subscribe((res) => {
      // Assert
      expect(res).toEqual(mockUsers);
      expect(httpMock.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/users'
      );
      done();
    });
  });

  test('should return user by ID from cached users', () => {
    // Arrange
    (service as any).Users = mockUsers;

    // Act
    service.getById('2').subscribe((user) => {
      // Assert
      expect(user).toEqual(mockUsers[1]);
    });
  });

  test('should get user profile from API', () => {
    // Arrange
    const userId = '1';
    const user = mockUsers[0];
    httpMock.get.mockReturnValue(of(user));

    // Act
    service.getProfile(userId).subscribe((res) => {
      // Assert
      expect(res).toEqual(user);
      expect(httpMock.get).toHaveBeenCalledWith(
        `http://localhost:3000/api/v1/users/${userId}`
      );
    });
  });

  test('should change user password via PATCH', () => {
    // Arrange
    const response = { success: true };
    const id = '1';
    const currentPassword = 'old';
    const newPassword = 'new';
    httpMock.patch.mockReturnValue(of(response));

    // Act
    service
      .changePassword(id, currentPassword, newPassword)
      .subscribe((res) => {
        // Assert
        expect(res).toEqual(response);
        expect(httpMock.patch).toHaveBeenCalledWith(
          `http://localhost:3000/api/v1/users/${id}/password`,
          { currentPassword, newPassword }
        );
      });
  });

  test('should create user via POST', () => {
    // Arrange
    const newUser = mockUsers[1];
    httpMock.post.mockReturnValue(of(newUser));

    // Act
    service.create(newUser).subscribe((res) => {
      // Assert
      expect(res).toEqual(newUser);
      expect(httpMock.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/users',
        newUser
      );
    });
  });

  test('should update user via PUT and update cache', () => {
    // Arrange
    const updatedUser = { ...mockUsers[0], name: 'Ana Actualizada' };
    const response = { data: updatedUser };
    (service as any).Users = [...mockUsers];
    httpMock.put.mockReturnValue(of(response));

    // Act
    service.update('1', updatedUser).subscribe((res) => {
      // Assert
      expect(res).toEqual(updatedUser);
      expect((service as any).Users[0].name).toBe('Ana Actualizada');
      expect(httpMock.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/users/1',
        updatedUser
      );
    });
  });

  test('should delete user via DELETE and update cache', () => {
    // Arrange
    const deletedUser = { ...mockUsers[1], name: 'deleted' };
    const response = { data: deletedUser };
    (service as any).Users = [...mockUsers];
    httpMock.delete.mockReturnValue(of(response));

    // Act
    service.delete('2').subscribe((res) => {
      // Assert
      expect(res).toEqual(deletedUser);
      expect(httpMock.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/users/2'
      );
    });
  });
});
