export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  role: string | null;
  createdAt: string;
}
