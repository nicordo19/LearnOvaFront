import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/authService';
import { LoginRequest } from './login-request';
@Component({
  selector: 'app-login-component',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.loginData.email.trim() === '' || this.loginData.password.trim() === '') {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        this.authService.setLoggedIn(true);

        // ✅ Charger le profil pour que currentUser$ soit rempli
        this.authService.loadProfile().subscribe({
          next: (profile) => {
            this.authService.setCurrentUser(profile);
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            console.error('Erreur lors du chargement du profil:', err);
            this.router.navigate(['/profile']);
          },
        });
      },
      error: (error) => {
        console.error('Erreur lors de la connexion', error);
        alert('Erreur lors de la connexion. Veuillez réessayer.');
      },
    });
  }
}
