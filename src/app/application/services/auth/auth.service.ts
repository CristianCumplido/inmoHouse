import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';
import { environment } from 'src/app/environment/envoronment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.BASE_URL_API;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http: HttpClient) {}

  login(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, userData).pipe(
      tap((user: any) => {
        this.currentUserSubject.next(user.data.user);
      })
    );
  }
  logout() {
    this.currentUserSubject.next(null);
  }
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  loginWithAzure(azureTokenReq: string) {
    return this.http
      .post(`${this.baseUrl}/auth/azure-login`, {
        azureToken: azureTokenReq,
      })
      .pipe(
        tap((user: any) => {
          this.currentUserSubject.next(user.data.user);
          // Opcional: guarda en localStorage si quieres persistencia
          localStorage.setItem('currentUser', JSON.stringify(user));
        })
      );
  }
  // ✅ Método para registrar un usuario
  register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }
}
