import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { UserVideo } from '../app/features/videos/user-video';
import { VideoUploadResponse } from '../app/features/videos/video-upload-response';

export interface VideoUpdateRequest {
  title: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly apiUrl = 'http://localhost:8080/api/videos';
  private readonly uploadUrl = 'http://localhost:8080/api/videos/upload';
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

  getMyVideos(): Observable<UserVideo[]> {
    return this.http.get<UserVideo[]>(`${this.apiUrl}/my-videos`, {
      withCredentials: true,
    });
  }

  getAllVideos(): Observable<UserVideo[]> {
    return this.http.get<UserVideo[]>(this.apiUrl, {
      withCredentials: true,
    });
  }

  getVideoById(videoId: string): Observable<UserVideo> {
    return this.http.get<UserVideo>(`${this.apiUrl}/${videoId}`, {
      withCredentials: true,
    });
  }

  getLikedVideos(): Observable<UserVideo[]> {
    return this.http.get<UserVideo[]>(`${this.apiUrl}/liked`, {
      withCredentials: true,
    });
  }

  likeVideo(videoId: string): Observable<UserVideo> {
    return this.http.post<UserVideo>(
      `${this.apiUrl}/${videoId}/like`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  unlikeVideo(videoId: string): Observable<UserVideo> {
    return this.http.delete<UserVideo>(`${this.apiUrl}/${videoId}/like`, {
      withCredentials: true,
    });
  }

  deleteVideo(videoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${videoId}`, {
      withCredentials: true,
    });
  }

  updateVideo(videoId: string, payload: VideoUpdateRequest): Observable<UserVideo> {
    return this.http.put<UserVideo>(`${this.apiUrl}/${videoId}`, payload, {
      withCredentials: true,
    });
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
