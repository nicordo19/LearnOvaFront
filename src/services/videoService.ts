import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { VideoUploadResponse } from '../app/features/videos/video-upload-response';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly uploadUrl = 'http://localhost:8080/video/upload';
  private readonly allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  private readonly maxVideoSizeBytes = 250 * 1024 * 2024; // 450 MB

  constructor(private http: HttpClient) {}

  uploadVideo(file: File): Observable<VideoUploadResponse> {
    const validationError = this.validateFile(file);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<VideoUploadResponse>(this.uploadUrl, formData, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  getAllowedTypes(): string[] {
    return [...this.allowedTypes];
  }

  getMaxVideoSizeMb(): number {
    return Math.round(this.maxVideoSizeBytes / 1024 / 1024);
  }

  private validateFile(file: File): string | null {
    if (!file) {
      return 'Aucun fichier n’a été sélectionné.';
    }

    if (!this.allowedTypes.includes(file.type)) {
      return 'Format non autorisé. Utilisez mp4, mov ou webm.';
    }

    if (file.size > this.maxVideoSizeBytes) {
      return `Le fichier dépasse la taille maximale de ${this.getMaxVideoSizeMb()} Mo.`;
    }

    return null;
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Erreur inconnue lors de l’upload de la vidéo.';

    if (error.error instanceof ErrorEvent) {
      message = `Erreur réseau : ${error.error.message}`;
    } else if (error.status === 0) {
      message = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.status === 401 || error.status === 403) {
      message = 'Vous n’êtes pas autorisé à uploader une vidéo. Connexion requise.';
    } else if (error.status === 413) {
      message = 'La vidéo est trop volumineuse pour le serveur.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else {
      message = `Erreur serveur ${error.status} : ${error.statusText}`;
    }

    return throwError(() => new Error(message));
  }
}
