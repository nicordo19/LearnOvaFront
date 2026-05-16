import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginRequest } from '../app/features/auth/login-component/login-request';
import { LoginResponse } from '../app/features/auth/login-component/login-response';
import { UserRegister } from '../app/features/auth/register-component/user-register';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

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
        this.setLoggedIn(false);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
        alert('Erreur lors de la déconnexion. Veuillez réessayer.');
      },
    });
  }
}
