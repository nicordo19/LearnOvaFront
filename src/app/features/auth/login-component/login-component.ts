import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.loginData.email.trim() === '' || this.loginData.password.trim() === '') {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        alert('Connexion réussie !');
      },

      error: (error) => {
        console.error('Erreur lors de la connexion', error);
        alert('Erreur lors de la connexion. Veuillez réessayer.');
      },
    });
  }
}
