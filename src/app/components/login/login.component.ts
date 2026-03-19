import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  name = '';

  constructor(private auth: AuthService,
    private router: Router) { }

  login() {
    this.auth.login(this.name).subscribe((res: any) => {
      localStorage.setItem('user', JSON.stringify(res));
      this.router.navigate(['/scan']);
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