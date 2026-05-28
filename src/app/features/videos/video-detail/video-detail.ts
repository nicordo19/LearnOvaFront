import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VideoService } from '../../../../services/videoService';
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
  loading = true;
  error: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private videoService: VideoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
}
