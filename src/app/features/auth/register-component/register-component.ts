import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../services/userService';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  etudiant: boolean = false;
  professeur: boolean = false;
  firstName: string = '';
  lastName: string = '';
  email: string = '';

  profession: string = '';
  password: string = '';
  userType: string = '';

  constructor(private userService: UserService) {}
  selectRole(role: string) {
    if (role === 'etudiant') {
      this.etudiant = true;
      this.professeur = false;
    }

    if (role === 'professeur') {
      this.professeur = true;
      this.etudiant = false;
    }
  }

  onSubmit() {
    if (
      this.userType === '' ||
      this.email.trim() === '' ||
      this.password.trim() === '' ||
      this.profession.trim() === ''
    ) {
      alert('Veuillez remplir tous les champs requis.');
      return;
    }

    this.etudiant = this.userType === 'etudiant';
    this.professeur = this.userType === 'professeur';

    const formData = {
      etudiant: this.etudiant,
      professeur: this.professeur,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      profession: this.profession,
      password: this.password,
    };

    console.log('Inscription soumise', formData);
    this.userService.register(formData).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);
        alert('Inscription réussie !');
      },
      error: (error) => {
        console.error("Erreur lors de l'inscription", error);
        alert("Erreur lors de l'inscription. Veuillez réessayer.");
      },
    });
  }
}
