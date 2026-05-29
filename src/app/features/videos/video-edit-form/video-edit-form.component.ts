import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserVideo } from '../user-video';

export interface VideoEditFormValue {
  title: string;
  description: string;
}

@Component({
  selector: 'app-video-edit-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './video-edit-form.component.html',
  styleUrl: './video-edit-form.component.scss',
})
export class VideoEditFormComponent implements OnChanges {
  @Input({ required: true }) video!: UserVideo;
  @Input() saving = false;
  @Output() save = new EventEmitter<VideoEditFormValue>();
  @Output() cancel = new EventEmitter<void>();

  title = '';
  description = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['video']) {
      this.title = this.video?.title ?? '';
      this.description = this.video?.description ?? '';
    }
  }

  submit(): void {
    this.save.emit({
      title: this.title,
      description: this.description,
    });
  }
}
