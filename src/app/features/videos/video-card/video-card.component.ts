import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserVideo } from '../user-video';
import { getUploaderName, getVideoSource } from '../video-utils';

@Component({
  selector: 'app-video-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCard {
  @Input({ required: true }) video!: UserVideo;
  @Input() titleFallback = 'Vidéo';
  @Input() showUploader = true;
  @Input() showLikes = false;

  readonly getUploaderName = getUploaderName;
  readonly getVideoSource = getVideoSource;
}
