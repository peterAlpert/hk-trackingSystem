import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashbaord.component.html',
  styleUrl: './dashbaord.component.css'
})
export class DashbaordComponent {
  user: any;

  ngOnInit() {
    const u = localStorage.getItem('user');
    if (u) this.user = JSON.parse(u);
  }

}
