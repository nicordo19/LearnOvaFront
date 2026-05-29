import { UserVideo } from './user-video';

export function getVideoSource(video: UserVideo): string | null {
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

export function getUploaderName(video: UserVideo): string {
  const firstName = video.userFirstName ?? video.userFirstname ?? video.userfirstname;
  const lastName = video.userLastName ?? video.userLastname ?? video.userlastname;

  return [firstName, lastName].filter(Boolean).join(' ') || 'Professeur NOVA';
}
