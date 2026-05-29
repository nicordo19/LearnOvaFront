import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { UserService } from '../../../../services/userService';
import { VideoService } from '../../../../services/videoService';
import { UserVideo } from '../../videos/user-video';
import { getUploaderName } from '../../videos/video-utils';
import { UserProfileResponse } from './userProfileResponse';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  user: UserProfileResponse | null = null;
  loading = true;
  error: string | null = null;
  isProfessor = false;
  uploadedVideos: UserVideo[] = [];
  likedVideos: UserVideo[] = [];
  loadingUploadedVideos = false;
  loadingLikedVideos = false;
  uploadedVideoError: string | null = null;
  likedVideoError: string | null = null;
  editingVideoId: string | null = null;
  editTitle = '';
  editDescription = '';
  savingVideoId: string | null = null;
  readonly getUploaderName = getUploaderName;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private videoService: VideoService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Profile init - appel getProfile()');

    // Réagir aux query params pour forcer le rechargement des vidéos
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      console.log('Profile queryParams:', params);
      if (params && params['refresh']) {
        console.log('Refresh param détecté, rechargement des vidéos');
        if (this.user) {
          if (this.isProfessor) {
            this.loadUploadedVideos();
          }
          this.loadLikedVideos();
        }
      }
    });

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
          if (this.isProfessor) {
            this.loadUploadedVideos();
          }
          this.loadLikedVideos();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil:', err);
          this.error = 'Non connecté ou session expirée.';
          this.loading = false;
          this.authService.setCurrentUser(null);
          this.isProfessor = false;
          this.uploadedVideos = [];
          this.likedVideos = [];
          this.cdr.markForCheck();
        },
      });
  }

  loadUploadedVideos(): void {
    this.loadingUploadedVideos = true;
    this.uploadedVideoError = null;

    console.log('Appel getMyVideos()');
    this.videoService
      .getMyVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uploadedVideos) => {
          console.log('Réponse getMyVideos:', uploadedVideos);
          this.uploadedVideos = uploadedVideos;
          this.loadingUploadedVideos = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des vidéos :', err);
          this.uploadedVideoError = 'Impossible de charger les vidéos.';
          this.loadingUploadedVideos = false;
          this.cdr.markForCheck();
        },
      });
  }

  loadLikedVideos(): void {
    this.loadingLikedVideos = true;
    this.likedVideoError = null;

    this.videoService
      .getLikedVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos) => {
          this.likedVideos = videos;
          this.loadingLikedVideos = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des vidéos likées :', err);
          this.likedVideoError = 'Impossible de charger les vidéos likées.';
          this.loadingLikedVideos = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  deleteVideo(videoId: string): void {
    if (!confirm('Supprimer cette vidéo ?')) {
      return;
    }

    this.videoService
      .deleteVideo(videoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.uploadedVideos = this.uploadedVideos.filter((video) => video.id !== videoId);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la vidéo :', err);
          this.uploadedVideoError = 'Impossible de supprimer la vidéo.';
          this.cdr.markForCheck();
        },
      });
  }

  startEditVideo(video: UserVideo): void {
    this.editingVideoId = video.id;
    this.editTitle = video.title ?? '';
    this.editDescription = video.description ?? '';
    this.uploadedVideoError = null;
    this.cdr.markForCheck();
  }

  cancelEditVideo(): void {
    this.editingVideoId = null;
    this.editTitle = '';
    this.editDescription = '';
    this.cdr.markForCheck();
  }

  saveVideo(video: UserVideo): void {
    const title = this.editTitle.trim();
    const description = this.editDescription.trim();

    if (!title) {
      this.uploadedVideoError = 'Le titre de la vidéo est obligatoire.';
      this.cdr.markForCheck();
      return;
    }

    this.savingVideoId = video.id;
    this.uploadedVideoError = null;

    this.videoService
      .updateVideo(video.id, { title, description })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedVideo) => {
          this.uploadedVideos = this.uploadedVideos.map((currentVideo) =>
            currentVideo.id === video.id
              ? { ...currentVideo, ...updatedVideo, title, description }
              : currentVideo,
          );
          this.savingVideoId = null;
          this.cancelEditVideo();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la vidéo :', err);
          this.uploadedVideoError = 'Impossible de modifier la vidéo.';
          this.savingVideoId = null;
          this.cdr.markForCheck();
        },
      });
  }

}
