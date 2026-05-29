import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { UserService } from '../../../../services/userService';
import { LikedVideosSection } from './liked-videos-section/liked-videos-section.component';
import { UploadedVideosSection } from './uploaded-videos-section/uploaded-videos-section.component';
import { UserProfileResponse } from './userProfileResponse';

type ProfileVideoTab = 'uploaded' | 'liked';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, UploadedVideosSection, LikedVideosSection],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class Profile implements OnInit, OnDestroy {
  user: UserProfileResponse | null = null;
  loading = true;
  error: string | null = null;
  isProfessor = false;
  activeVideoTab: ProfileVideoTab = 'liked';
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
          this.activeVideoTab = this.isProfessor ? 'uploaded' : 'liked';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil:', err);
          this.error = 'Non connecté ou session expirée.';
          this.loading = false;
          this.authService.setCurrentUser(null);
          this.isProfessor = false;
          this.activeVideoTab = 'liked';
          this.cdr.markForCheck();
        },
      });
  }

  showVideoTab(tab: ProfileVideoTab): void {
    if (this.activeVideoTab === tab) {
      return;
    }

    this.activeVideoTab = tab;
  }

  getRoleLabel(role: string | null): string {
    if (!role) {
      return 'Non défini';
    }

    return role.toUpperCase().includes('PROF') ? 'Professeur' : 'Étudiant';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
