import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserRegister } from '../app/features/auth/register-component/user-register';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';
  constructor(private http: HttpClient) {}
  register(userData: UserRegister) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
