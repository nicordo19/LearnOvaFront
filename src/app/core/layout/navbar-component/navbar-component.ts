import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/authService';

@Component({
  standalone: true,
  selector: 'app-navbar-component',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.scss',
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  get isLoggedIn$() {
    return this.authService.isLoggedIn$;
  }
}
