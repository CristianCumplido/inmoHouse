import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';
import { UserApiService } from 'src/app/infrastructure/api/user-api/user-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: UserApiService) {}

  getAll(): Observable<User[]> {
    return this.api.getAll();
  }

  getById(id: string): Observable<User> {
    return this.api.getById(id);
  }
  getProfile(id: string): Observable<any> {
    return this.api.getProfile(id);
  }
  changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.api.changePassword(id, currentPassword, newPassword);
  }
  create(user: User): Observable<User> {
    return this.api.create(user);
  }

  update(id: string, user: User): Observable<User> {
    return this.api.update(id, user);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
  filterUsers(
    users: User[],
    filters: {
      role?: UserRole;
      search?: string;
    }
  ): User[] {
    return users.filter((u) => {
      const matchesRole = !filters.role || u.role === filters.role;
      const matchesSearch =
        !filters.search ||
        u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(filters.search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }
}
