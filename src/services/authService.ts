import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginRequest } from '../app/features/auth/login-component/login-request';
import { LoginResponse } from '../app/features/auth/login-component/login-response';
import { UserProfileResponse } from '../app/features/auth/profile/userProfileResponse';
import { UserRegister } from '../app/features/auth/register-component/user-register';
import { UserService } from './userService';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<UserProfileResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData, {
      withCredentials: true,
    });
  }

  register(userData: UserRegister): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    });
  }

  loadProfile(): Observable<UserProfileResponse> {
    return this.userService.getProfile();
  }

  setCurrentUser(user: UserProfileResponse | null): void {
    this.currentUserSubject.next(user);
    this.setLoggedIn(!!user);
  }

  getCurrentUser(): UserProfileResponse | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  isProfessor(): boolean {
    const r = this.currentUserSubject.value?.role;
    if (!r) return false;
    const s = (typeof r === 'string' ? r : JSON.stringify(r)).toUpperCase();
    // accepte 'ROLE_PROF', 'PROF', 'PROFESSEUR', etc.
    return s.includes('PROF');
  }

  setLoggedIn(isLoggedIn: boolean): void {
    this.isLoggedInSubject.next(isLoggedIn);
  }

  getIsLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Déconnexion réussie');
        this.setCurrentUser(null);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
        alert('Erreur lors de la déconnexion. Veuillez réessayer.');
      },
    });
  }
}
