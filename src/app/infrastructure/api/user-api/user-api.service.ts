import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';
import { environment } from 'src/app/environment/envoronment';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.BASE_URL_API;
  private Users: User[] = [];
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

  getAll(): Observable<User[]> {
    return this.http.get<{ data: User[] }>(`${this.baseUrl}/users`).pipe(
      tap((res) => {
        this.Users = res.data;
      }),
      map((res) => res.data)
    );
  }
  getProfile(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }
  getById(id: string) {
    return of(this.Users.find((u) => u.id === id)!);
  }
  changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/${id}/password`, {
      currentPassword: currentPassword,
      newPassword: newPassword,
    });
  }

  create(user: User) {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  update(id: string, user: User): Observable<User> {
    return this.http
      .put<{ data: User }>(`${this.baseUrl}/users/${id}`, user)
      .pipe(
        tap((res) => {
          const idx = this.Users.findIndex((p) => p.id === id);
          if (idx !== -1) {
            this.Users[idx] = res.data;
          }
        }),
        map((res) => res.data)
      );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<{ data: User }>(`${this.baseUrl}/users/${id}`).pipe(
      tap((res) => {
        const idx = this.Users.findIndex((p) => p.id === id);
        if (idx !== -1) {
          this.Users[idx] = res.data;
        }
      }),
      map((res) => res.data)
    );
  }
}
