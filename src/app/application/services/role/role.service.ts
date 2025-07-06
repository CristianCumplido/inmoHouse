import { Injectable, computed, signal } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { UserRole } from '../../../core/models/roles.enum';
@Injectable({ providedIn: 'root' })
export class RoleService {
  private currentUser = signal<User | null>(null);

  setUser(user: User) {
    this.currentUser.set(user);
    console.log('User set:', this.currentUser);
  }

  get user() {
    return this.currentUser.asReadonly();
  }

  get role() {
    return computed(() => this.currentUser()?.role ?? null);
  }

  isAdmin() {
    return this.role() === UserRole.ADMIN;
  }

  isAgent() {
    return this.role() === UserRole.AGENT;
  }

  isClient() {
    return this.role() === UserRole.CLIENT;
  }
}
