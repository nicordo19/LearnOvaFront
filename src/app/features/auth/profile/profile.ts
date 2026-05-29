import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { UserService } from '../../../../services/userService';
import { LikedVideosSection } from './liked-videos-section/liked-videos-section';
import { UploadedVideosSection } from './uploaded-videos-section/uploaded-videos-section';
import { UserProfileResponse } from './userProfileResponse';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, UploadedVideosSection, LikedVideosSection],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  user: UserProfileResponse | null = null;
  loading = true;
  error: string | null = null;
  isProfessor = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Profile init - appel getProfile()');

    this.userService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Profile récupéré:', data);
          this.user = data;
          this.loading = false;
          this.authService.setCurrentUser(data);
          this.isProfessor = this.authService.isProfessor();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil:', err);
          this.error = 'Non connecté ou session expirée.';
          this.loading = false;
          this.authService.setCurrentUser(null);
          this.isProfessor = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
