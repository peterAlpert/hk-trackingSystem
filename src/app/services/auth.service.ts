import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  user$ = new BehaviorSubject<any>(this.getUser());

  getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.user$.next(user); // 🔥 تحديث فوري
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user$.next(null); // 🔥 تحديث فوري
  }

}
