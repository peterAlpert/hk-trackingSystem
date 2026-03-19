import { Component, OnInit } from '@angular/core';
import { LockerService } from '../../services/locker.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-check-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './check-history.component.html'
})
export class CheckHistoryComponent implements OnInit {

  checks: any[] = [];
  allChecks: any[] = [];
  loading = true;

  constructor(private _lockerService: LockerService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this._lockerService.getAllChecks().subscribe({
      next: (res: any) => {
        this.checks = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filter(type: string) {
    if (type === 'all') {
      this.checks = this.allChecks;
    } else {
      this.checks = this.allChecks.filter(x => x.status === type);
    }
  }
}