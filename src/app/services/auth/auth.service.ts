import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { user } from '../../models/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/oauth/token`;
  private readonly headers = new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  constructor(private http: HttpClient, private router: Router) {}

  /** Autentica al usuario y obtiene un token */
  getToken(dataUser: user): Observable<any> {
    const body = this.createUrlEncodedBody({
      grant_type: 'password',
      client_id: environment.clientID,
      client_secret: environment.clientSecret,
      username: dataUser.username,
      password: dataUser.password
    });

    return this.http.post(this.apiUrl, body, { headers: this.headers });
  }

  /** Renueva el token de acceso utilizando el refresh token */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return of(null);
    }

    const body = this.createUrlEncodedBody({
      grant_type: 'refresh_token',
      client_id: environment.clientID,
      client_secret: environment.clientSecret,
      refresh_token: refreshToken
    });

    return this.http.post(this.apiUrl, body, { headers: this.headers });
  }

  /** Verifica si el usuario está logueado */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
  getAccessToken(){
    return localStorage.getItem('access_token');
  }
  /** Cierra la sesión del usuario */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigateByUrl('/login');
  }

  /** Crea un cuerpo URL-encoded a partir de un objeto */
  private createUrlEncodedBody(params: { [key: string]: string }): string {
    const body = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => body.set(key, value));
    return body.toString();
  }
}
