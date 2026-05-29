import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../services/authService';
import { VideoCommentService } from '../../../../services/videoCommentService';
import { UserProfileResponse } from '../../auth/profile/userProfileResponse';
import { VideoComment } from '../video-comment';

@Component({
  selector: 'app-video-comments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './video-comments.component.html',
  styleUrl: './video-comments.component.scss',
})
export class VideoComments implements OnChanges, OnDestroy {
  @Input({ required: true }) videoId!: string;

  comments: VideoComment[] = [];
  currentUser: UserProfileResponse | null = null;
  newComment = '';
  loadingComments = false;
  savingComment = false;
  commentError: string | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private videoCommentService: VideoCommentService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoId'] && this.videoId) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.loadingComments = true;
    this.commentError = null;

    this.videoCommentService
      .getVideoComments(this.videoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments;
          this.loadingComments = false;
          this.cdr.markForCheck();
        },
        error: (error: Error) => {
          this.commentError = error.message || 'Impossible de charger les commentaires.';
          this.loadingComments = false;
          this.cdr.markForCheck();
        },
      });
  }

  addComment(): void {
    const content = this.newComment.trim();

    if (!content) {
      this.commentError = 'Le commentaire ne peut pas être vide.';
      this.cdr.markForCheck();
      return;
    }

    this.savingComment = true;
    this.commentError = null;

    this.videoCommentService
      .addVideoComment(this.videoId, { content })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comment) => {
          this.comments = [...this.comments, comment];
          this.newComment = '';
          this.savingComment = false;
          this.cdr.markForCheck();
        },
        error: (error: Error) => {
          this.commentError = error.message || 'Impossible d’ajouter le commentaire.';
          this.savingComment = false;
          this.cdr.markForCheck();
        },
      });
  }

  getAuthorName(comment: VideoComment): string {
    return `${comment.authorFirstName || ''} ${comment.authorLastName || ''}`.trim() || 'Utilisateur';
  }

  isProfessorComment(comment: VideoComment): boolean {
    return comment.authorRole?.toUpperCase().includes('PROF');
  }

  getAuthorRoleLabel(comment: VideoComment): string {
    return this.isProfessorComment(comment) ? 'Professeur' : 'Étudiant';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
