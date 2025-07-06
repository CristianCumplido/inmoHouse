import { Injectable } from '@angular/core';
import { UserRole } from 'src/app/core/models/roles.enum';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  logout() {
    // Implement logout logic here, such as clearing tokens or user data
    console.log('User logged out');
  }
  isLoggedIn(): boolean {
    // Replace this logic with your actual authentication check
    // return !!localStorage.getItem('token');
    return true;
  }

  private currentUser: User | null = null;

  // Add this method to return the current user
  getUser(): User | null {
    // return this.currentUser;
    return {
      id: '1',
      name: 'Cristian Cumplido',
      email: 'smcumpli@gmail.com',
      role: UserRole.ADMIN, // Cast to UserRole or use the correct enum value
    };
  }
}
