import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest } from '../app/features/auth/login-component/login-request';
import { LoginResponse } from '../app/features/auth/login-component/login-response';
import { UserRegister } from '../app/features/auth/register-component/user-register';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData, {
      withCredentials: true,
    });
  }
  register(userData: UserRegister) {
    return this.http.post(`${this.apiUrl}/register`, userData, {
      withCredentials: true,
    });
  }
}
