export interface VideoComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorFirstName: string;
  authorLastName: string;
  authorRole: 'ROLE_PROF' | 'ROLE_USER' | string;
}

export interface CreateVideoCommentRequest {
  content: string;
}
