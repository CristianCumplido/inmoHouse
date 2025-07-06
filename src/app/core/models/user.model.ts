import { UserRole } from './roles.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string; // URL de la foto del usuario
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  phone?: string;
  address?: string;
  birthDate?: Date;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  isActive?: boolean;
}

export interface UserFilterOptions {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}
