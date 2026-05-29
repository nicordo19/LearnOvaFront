import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VideoService } from '../../../../../services/videoService';
import { UserVideo } from '../../../videos/user-video';
import { getUploaderName, getVideoSource } from '../../../videos/video-utils';

@Component({
  selector: 'app-liked-videos-section',
  imports: [CommonModule, RouterLink],
  templateUrl: './liked-videos-section.html',
  styleUrl: '../profile.scss',
})
export class LikedVideosSection implements OnInit, OnDestroy {
  likedVideos: UserVideo[] = [];
  loadingLikedVideos = false;
  likedVideoError: string | null = null;
  readonly getUploaderName = getUploaderName;
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
        this.loadLikedVideos();
      }
    });

    this.loadLikedVideos();
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
}
