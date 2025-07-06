import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    role: 'Administrador',
  };

  lastUpdated: Date = new Date();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // Aquí cargarías los datos del usuario desde un servicio
    // this.userService.getCurrentUser().subscribe(user => {
    //   this.user = user;
    // });
  }

  editProfile(): void {
    // Navegar a la página de edición de perfil
    this.router.navigate(['/profile/edit']);

    // O abrir un modal de edición
    // this.openEditModal();
  }

  changePassword(): void {
    // Navegar a la página de cambio de contraseña
    this.router.navigate(['/change-password']);

    // O abrir un modal de cambio de contraseña
    // this.openChangePasswordModal();
  }

  // Método opcional para abrir modal de edición
  private openEditModal(): void {
    // Implementar lógica del modal
    console.log('Abriendo modal de edición');
  }

  // Método opcional para abrir modal de cambio de contraseña
  private openChangePasswordModal(): void {
    // Implementar lógica del modal
    console.log('Abriendo modal de cambio de contraseña');
  }
}
