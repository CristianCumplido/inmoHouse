import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/application/services/auth/auth.service';
import { RoleService } from 'src/app/application/services/role/role.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  authService = inject(AuthService);
  roleService = inject(RoleService);
  router = inject(Router);
  user: any;
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      console.log('User actualizado:', this.user);
    });
  }

  redirectToHome() {
    if (this.user.role === 'Administrator') {
      this.router.navigate(['/admin']);
    } else if (this.user.role === 'Agente') {
      this.router.navigate(['/agent']);
    } else if (this.user.role === 'Cliente') {
      this.router.navigate(['/client']);
    }
  }
}
