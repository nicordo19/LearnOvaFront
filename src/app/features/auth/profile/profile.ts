import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/authService';
import { UserService } from '../../../../services/userService';
import { UserProfileResponse } from './userProfileResponse';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: UserProfileResponse | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Profile init - appel getProfile()');
    this.userService.getProfile().subscribe({
      next: (data) => {
        console.log('Profile récupéré:', data);
        this.user = data;
        this.loading = false;
        this.authService.setLoggedIn(true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du profil:', err);
        this.error = 'Non connecté ou session expirée.';
        this.loading = false;
        this.authService.setLoggedIn(false);
        this.cdr.markForCheck();
      },
    });
  }
}
