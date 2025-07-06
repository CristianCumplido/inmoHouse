import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private mockUsers: User[] = [
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

  getAll() {
    return of(this.mockUsers);
  }

  getById(id: string) {
    return of(this.mockUsers.find((u) => u.id === id)!);
  }

  create(user: User) {
    user.id = crypto.randomUUID();
    this.mockUsers.push(user);
    return of(user);
  }

  update(id: string, user: User) {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    this.mockUsers[index] = { ...user, id };
    return of(this.mockUsers[index]);
  }

  delete(id: string) {
    this.mockUsers = this.mockUsers.filter((u) => u.id !== id);
    return of();
  }
}
