import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/authService';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private authService: AuthService) {
    // Charger le profil au bootstrap si un cookie JWT existe
    this.authService.loadProfile().subscribe({
      next: (profile) => this.authService.setCurrentUser(profile),
      error: () => {}, // Silent error, l'utilisateur n'est pas connecté
    });
  }
}
