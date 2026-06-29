import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './../../../../services/authService';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
  registerError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}
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
    this.registerError = null;

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

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.registerError = this.getRegisterErrorMessage(error);
        this.cdr.detectChanges();
      },
    });
  }

  private getRegisterErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('error' in error)) {
      return "Impossible de finaliser l'inscription. Vérifiez les informations saisies.";
    }

    const responseError = error.error;

    if (typeof responseError === 'string' && responseError.trim()) {
      return responseError;
    }

    if (typeof responseError === 'object' && responseError !== null) {
      for (const key of ['message', 'error', 'detail', 'title']) {
        if (
          key in responseError &&
          typeof responseError[key as keyof typeof responseError] === 'string'
        ) {
          return responseError[key as keyof typeof responseError] as string;
        }
      }
    }

    if ('status' in error && typeof error.status === 'number') {
      if (error.status === 409) {
        return 'Cette adresse e-mail est déjà utilisée.';
      }

      if (error.status === 403) {
        return "Inscription refusée. Cette adresse e-mail est peut-être déjà utilisée ou l'inscription est bloquée.";
      }
    }

    return "Impossible de finaliser l'inscription. Vérifiez les informations saisies.";
  }
}
