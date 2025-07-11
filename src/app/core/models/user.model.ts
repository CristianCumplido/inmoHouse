import { UserRole } from './roles.enum';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  role: UserRole;
  department?: string;
  profileImage?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: Date;
  address?: string;
  photo?: string;
  updatedAt?: Date;
  lastLogin?: Date;
  stats?: UserStats;
  preferences?: UserPreferences;
  socialLinks?: SocialLinks;
  birthDate?: string;
  isActive?: boolean;
}

export interface UserStats {
  followers: number;
  following: number;
  posts: number;
  profileViews: number;
  likes: number;
  rating: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
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
