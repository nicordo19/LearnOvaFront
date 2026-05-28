import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { VideoService } from '../../../../services/videoService';
import { UserProfileResponse } from '../../auth/profile/userProfileResponse';
import { UserVideo } from '../user-video';

@Component({
  standalone: true,
  selector: 'app-video-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './video-detail.html',
  styleUrl: './video-detail.scss',
})
export class VideoDetail implements OnInit, OnDestroy {
  video: UserVideo | null = null;
  currentUser: UserProfileResponse | null = null;
  loading = true;
  error: string | null = null;
  likeError: string | null = null;
  updatingLike = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    const videoId = this.route.snapshot.paramMap.get('id');

    if (!videoId) {
      this.error = 'Vidéo introuvable.';
      this.loading = false;
      return;
    }

    this.videoService
      .getVideoById(videoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (video) => {
          this.video = video;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la vidéo :', error);
          this.error = 'Impossible de charger cette vidéo.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getVideoSource(video: UserVideo): string | null {
    return (
      video.secureUrl ??
      video.secure_url ??
      video.url ??
      video.publicUrl ??
      video.fileUrl ??
      video.videoUrl ??
      null
    );
  }

  getUploaderName(video: UserVideo): string {
    const firstName = video.userFirstName ?? video.userFirstname ?? video.userfirstname;
    const lastName = video.userLastName ?? video.userLastname ?? video.userlastname;

    return [firstName, lastName].filter(Boolean).join(' ') || 'Professeur NOVA';
  }

  isOwnVideo(video: UserVideo): boolean {
    return !!this.currentUser?.id && !!video.ownerId && this.currentUser.id === video.ownerId;
  }

  toggleLike(video: UserVideo): void {
    if (!this.currentUser) {
      this.likeError = 'Connecte-toi pour liker cette vidéo.';
      this.cdr.markForCheck();
      return;
    }

    if (this.isOwnVideo(video)) {
      return;
    }

    this.updatingLike = true;
    this.likeError = null;

    const request$ = video.likedByCurrentUser
      ? this.videoService.unlikeVideo(video.id)
      : this.videoService.likeVideo(video.id);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (updatedVideo) => {
        this.video = { ...video, ...updatedVideo };
        this.updatingLike = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du like :', error);
        this.likeError = 'Impossible de mettre à jour le like.';
        this.updatingLike = false;
        this.cdr.markForCheck();
      },
    });
  }
}
