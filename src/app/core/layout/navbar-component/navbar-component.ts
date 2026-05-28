import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/authService';

@Component({
  standalone: true,
  selector: 'app-navbar-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss',
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  get isLoggedIn$() {
    return this.authService.isLoggedIn$;
  }

  goToProfile(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/profile'], { queryParams: { refresh: Date.now() } });
  }
}
