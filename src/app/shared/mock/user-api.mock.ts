import { of } from 'rxjs';
import { UserApiService } from 'src/app/infrastructure/api/user-api/user-api.service';
import { User } from 'src/app/core/models/user.model';
import { UserRole } from 'src/app/core/models/roles.enum';

export const mockUsers: User[] = [
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

export const mockUserApiService: jest.Mocked<Partial<UserApiService>> = {
  getAll: jest.fn().mockReturnValue(of(mockUsers)),
  getById: jest
    .fn()
    .mockImplementation((id: string) =>
      of(mockUsers.find((u) => u.id === id)!)
    ),
  getProfile: jest.fn().mockReturnValue(of(mockUsers[0])),
  changePassword: jest
    .fn()
    .mockReturnValue(of({ message: 'Password changed' })),
  create: jest
    .fn()
    .mockImplementation((user: User) => of({ ...user, id: '99' })),
  update: jest
    .fn()
    .mockImplementation((id: string, user: User) => of({ ...user, id })),
  delete: jest.fn().mockReturnValue(of({ id: '1' })),
};
