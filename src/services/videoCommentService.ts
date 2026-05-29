import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateVideoCommentRequest, VideoComment } from '../app/features/videos/video-comment';

@Injectable({
  providedIn: 'root',
})
export class VideoCommentService {
  private readonly apiUrl = 'http://localhost:8080/api/videos';

  constructor(private http: HttpClient) {}

  getVideoComments(videoId: string): Observable<VideoComment[]> {
    return this.http
      .get<VideoComment[]>(`${this.apiUrl}/${videoId}/comments`, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  addVideoComment(videoId: string, payload: CreateVideoCommentRequest): Observable<VideoComment> {
    return this.http
      .post<VideoComment>(`${this.apiUrl}/${videoId}/comments`, payload, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Erreur inconnue lors du chargement des commentaires.';

    if (error.status === 0) {
      message = 'Impossible de contacter le serveur.';
    } else if (error.status === 401 || error.status === 403) {
      message = 'Connecte-toi pour ajouter un commentaire.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.status) {
      message = `Erreur serveur ${error.status} : ${error.statusText}`;
    }

    return throwError(() => new Error(message));
  }
}
