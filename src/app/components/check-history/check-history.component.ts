import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LockerService } from '../../services/locker.service';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-check-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-history.component.html'
})
export class CheckHistoryComponent implements OnInit {

  checks: any[] = [];
  allChecks: any[] = [];
  loading = true;

  selectedDate: string | null = null; // لتخزين التاريخ المحدد
  buildingId: number = 0;

  currentFilter: string = 'all';
  searchText: string = '';


  constructor(
    private _lockerService: LockerService,
    private route: ActivatedRoute,
    private location: Location

  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.buildingId = +params['buildingId'] || 0;
      this.loadData();
    });
  }

  filter(type: string) {
    this.currentFilter = type;
    this.applyFilters();
  }

  filterByDate() {
    this.applyFilters();
  }

  filterByName() {
    this.applyFilters();
  }

  showTodayChecks() {
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
    this.applyFilters();
  }


  // filterByName() {
  //   const text = this.searchText.toLowerCase();

  //   this.checks = this.allChecks.filter(c =>
  //     c.userName?.toLowerCase().includes(text)
  //   );
  // }

  applyFilters() {
    let filtered = [...this.allChecks];

    // فلتر الاسم (المشرف)
    if (this.searchText) {
      const text = this.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.userName?.toLowerCase().includes(text)
      );
    }

    // فلتر التاريخ
    if (this.selectedDate) {
      const selected = new Date(this.selectedDate);
      filtered = filtered.filter(c => {
        const checkDate = new Date(c.date);
        return checkDate.toDateString() === selected.toDateString();
      });
    }

    // فلتر الحالة
    if (this.currentFilter === 'Clean') {
      filtered = filtered.filter(x => x.status === 0);
    } else if (this.currentFilter === 'NotClean') {
      filtered = filtered.filter(x => x.status === 1);
    }

    this.checks = filtered;
  }

  loadData() {
    this.loading = true;

    if (this.buildingId && this.buildingId !== 0) {
      this._lockerService.getChecksByBuilding(this.buildingId).subscribe({
        next: (res: any) => {
          this.handleData(res);
        }
      });
    } else {
      this._lockerService.getAllChecks().subscribe({
        next: (res: any) => {
          this.handleData(res);
        }
      });
    }

  }

  handleData(res: any[]) {
    const fullChecklist = [
      'توافر مناديل ورق',
      'توافر صابون ايدي',
      'نظافه الارضيات',
      'نظافه القواعد والمباول',
      'نظافه الاحواض والمرايات'
    ];

    this.allChecks = res.map((c: any) => ({
      ...c,
      date: c.date ? new Date(c.date) : null,
      items: fullChecklist.map(name => {
        const found = c.items.find((i: any) => i.name === name);
        return {
          name,
          isChecked: found ? found.isChecked : false
        };
      })
    }));

    this.checks = this.allChecks;
    this.loading = false;
  }


  goBack() {
    this.location.back();
  }

  // filter(type: string) {
  //   switch (type) {
  //     case 'Clean':
  //       this.checks = this.allChecks.filter(x => x.status === 0);
  //       break;
  //     case 'NotClean':
  //       this.checks = this.allChecks.filter(x => x.status === 1);
  //       break;
  //     case 'all':
  //       this.checks = this.allChecks;
  //       break;
  //     default:
  //       this.checks = this.allChecks;
  //   }

  // }

  formatDate(date: Date | null) {
    if (!date) return '';
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }


  confirmMarkAsClean(item: any) {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم تحويل الفحص من غير نظيف إلى نظيف',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'تأكيد',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        // لو ضغط تأكيد، حول الحالة
        this.markAsClean(item);
      }
    });
  }

  // دالة التحويل نفسها
  markAsClean(item: any) {
    this._lockerService.updateCheckStatus(item.id, 0).subscribe({
      next: () => {
        // تحديث الحالة محلياً
        item.status = 0;

        Swal.fire({
          icon: 'success',
          title: 'تم تحديث الفحص إلى نظيف ✅',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'حدث خطأ',
          text: 'لم يتم تحديث الحالة',
        });
      }
    });
  }

  @ViewChild('dateInput') dateInput!: ElementRef;

  openDatePicker() {
    this.dateInput.nativeElement.click();
  }

  // filterByDate() {
  //   if (!this.selectedDate) {
  //     this.checks = this.allChecks;
  //     return;
  //   }

  //   this.checks = this.allChecks.filter(c => {
  //     const checkDate = new Date(c.date);
  //     const selected = new Date(this.selectedDate!);
  //     return checkDate.toDateString() === selected.toDateString();
  //   });
  // }

  // showTodayChecks() {
  //   const today = new Date();
  //   this.selectedDate = today.toISOString().split('T')[0]; // yyyy-mm-dd
  //   this.filterByDate();
  // }
}