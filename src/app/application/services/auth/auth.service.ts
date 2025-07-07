import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/v1/auth';

  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  logout(userData: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, userData);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  // ✅ Método para registrar un usuario
  register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }
}
