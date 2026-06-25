import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.css'
})
export class BuildingsComponent {
  constructor(
    private router: Router,
    private location: Location
  ) { }

  goToBuilding(id: number) {
    this.router.navigate(['/checks'], { queryParams: { buildingId: id } });
  }

  goBack() {
    this.location.back();
  }

}
