import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { VideoService } from '../../../../services/videoService';
import { VideoUploadResponse } from '../video-upload-response';

@Component({
  standalone: true,
  selector: 'app-upload-video-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-video.component.html',
  styleUrl: './upload-video.component.scss',
})
export class UploadVideoComponent implements OnDestroy {
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFileSize = '';
  selectedFileType = '';
  previewUrl: string | null = null;
  uploadError: string | null = null;
  uploadSuccess = false;
  uploading = false;
  uploadedVideoUrl: string | null = null;
  isProfessor = false;
  isLoggedIn = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.isLoggedIn = !!user;
      this.isProfessor = this.authService.isProfessor();
      console.debug('currentUser', user, 'isProfessor', this.isProfessor);
    });
  }

  onFileSelected(event: Event) {
    this.uploadError = null;
    this.uploadSuccess = false;
    this.uploadedVideoUrl = null;
    this.previewUrl = null;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.selectedFileSize = this.formatBytes(file.size);
    this.selectedFileType = file.type || 'Type inconnu';
    this.previewUrl = URL.createObjectURL(file);

    if (!this.videoService.getAllowedTypes().includes(file.type)) {
      this.uploadError = 'Format non autorisé. Utilisez mp4, mov ou webm.';
    }
  }

  onUploadVideo() {
    this.uploadError = null;
    this.uploadSuccess = false;

    if (!this.isLoggedIn) {
      this.uploadError = 'Vous devez être connecté pour uploader une vidéo.';
      return;
    }

    if (!this.isProfessor) {
      this.uploadError = 'Seuls les professeurs peuvent uploader une vidéo.';
      return;
    }

    if (!this.selectedFile) {
      this.uploadError = 'Sélectionnez d’abord un fichier vidéo.';
      return;
    }

    this.uploading = true;
    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (response: VideoUploadResponse) => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.uploadedVideoUrl = response.secureUrl ?? response.url;
        console.log('Upload réussi, response:', response);
        this.router.navigate(['/profile'], { queryParams: { refresh: Date.now() } });
      },
      error: (error: Error) => {
        this.uploading = false;
        this.uploadError = error.message || 'Erreur lors de l’upload de la vidéo.';
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 octet';
    }
    const k = 1024;
    const sizes = ['octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
