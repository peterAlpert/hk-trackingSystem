import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      return true; // مسموح بالدخول
    } else {
      this.router.navigate(['/login']); // توجه لصفحة login
      return false;
    }
  }
}