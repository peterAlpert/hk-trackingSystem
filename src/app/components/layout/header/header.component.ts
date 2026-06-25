import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  user: any;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user; // 🔥 يتحدث تلقائي
    });
  }

  logout() {
    Swal.fire({
      title: 'تأكيد تسجيل الخروج',
      text: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، تسجيل الخروج',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // لو المستخدم أكد
        this.auth.logout();
        this.router.navigate(['/']);
      }
      // لو ألغى، لا يحدث شيء
    });
  }
}

