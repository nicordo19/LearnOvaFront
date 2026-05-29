import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VideoService } from '../../../../../services/videoService';
import { UserVideo } from '../../../videos/user-video';
import { getVideoSource } from '../../../videos/video-utils';

@Component({
  selector: 'app-uploaded-videos-section',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './uploaded-videos-section.html',
  styleUrl: '../profile.scss',
})
export class UploadedVideosSection implements OnInit, OnDestroy {
  uploadedVideos: UserVideo[] = [];
  loadingUploadedVideos = false;
  uploadedVideoError: string | null = null;
  editingVideoId: string | null = null;
  editTitle = '';
  editDescription = '';
  savingVideoId: string | null = null;
  readonly getVideoSource = getVideoSource;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params && params['refresh']) {
        this.loadUploadedVideos();
      }
    });

    this.loadUploadedVideos();
  }

  loadUploadedVideos(): void {
    this.loadingUploadedVideos = true;
    this.uploadedVideoError = null;

    this.videoService
      .getMyVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (uploadedVideos) => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
