import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://18.208.134.30/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * Sends a password reset request to the API
   * @param email The user's email address
   * @returns An Observable with the server response
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
}