import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  name = '';
  password = '';
  loading = false;

  constructor(private auth: AuthService,
    private router: Router) { }


  login() {
    this.loading = true;

    this.auth.login({
      name: this.name,
      password: this.password
    }).subscribe({
      next: (res: any) => {

        localStorage.setItem('token', res.token);
        this.auth.setUser(res.user); // 🔥 بدل localStorage

        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);

        this.loading = false; // 🔑 الزرار يرجع للوضع الطبيعي

        // لو السيرفر رجع 401 أو 400 يعني اسم أو باسورد غلط
        if (err.status === 401 || err.status === 400) {
          Swal.fire({
            icon: 'error',
            title: 'خطأ في تسجيل الدخول',
            text: 'الاسم أو كلمة المرور غير صحيحة',
            confirmButtonText: 'حسناً'
          });
        } else {
          // أي خطأ آخر
          Swal.fire({
            icon: 'error',
            title: 'حدث خطأ',
            text: 'يوجد مشكلة بالسيرفر، حاول لاحقاً',
            confirmButtonText: 'حسناً'
          });
        }
      }
    });
  }

  buttonClick() {
    const audio = new Audio('assets/sounds/click.mp3');
    audio.play();
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  buttonRelease() {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    }
  }
}