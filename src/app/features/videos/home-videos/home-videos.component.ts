import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VideoService } from '../../../../services/videoService';
import { UserVideo } from '../user-video';
import { VideoCard } from '../video-card/video-card.component';

@Component({
  standalone: true,
  selector: 'app-home-videos',
  imports: [CommonModule, VideoCard],
  templateUrl: './home-videos.component.html',
  styleUrl: './home-videos.component.scss',
})
export class HomeVideos implements OnInit, OnDestroy {
  videos: UserVideo[] = [];
  loading = true;
  error: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private videoService: VideoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.videoService
      .getAllVideos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (videos) => {
          this.videos = videos;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement du feed vidéos :', error);
          this.error = 'Impossible de charger les vidéos pour le moment.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
