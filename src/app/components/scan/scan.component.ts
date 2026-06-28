import { Router } from '@angular/router';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { LockerService } from '../../services/locker.service';
import Swal from 'sweetalert2';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
declare var bootstrap: any;


@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [FormsModule, ZXingScannerModule, CommonModule],
  templateUrl: './scan.component.html'
})
export class ScanComponent implements AfterViewInit {

  successAudio = new Audio('assets/sounds/success.mp3');
  warnAudio = new Audio('assets/sounds/warn.mp3');
  scannedLocker: any = null;
  status: string = 'Clean';
  note: string = '';
  loading = false;

  lastFocusedElement!: HTMLElement;

  checklist = [
    { name: 'توافر مناديل ورق', checked: true },
    { name: 'توافر صابون ايدي', checked: true },
    { name: 'نظافه الارضيات', checked: true },
    { name: 'نظافه القواعد والمباول', checked: true },
    { name: 'نظافه الاحواض والمرايات', checked: true }

  ];


  constructor(
    private _LockerService: LockerService,
    private Router: Router,
    private _ApiService: ApiService,
    private auth: AuthService
  ) { }

  ngAfterViewInit() {
    const modalEl = document.getElementById('lockerModal');

    modalEl?.addEventListener('hidden.bs.modal', () => {

      // 🧹 تنظيف الخلفية
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

      // 🧠 تنظيف الفوكس
      (document.activeElement as HTMLElement)?.blur();
      document.body.focus();

      // 🔥 رجّع الاسكانر يشتغل تاني
      this.startScannerAgain();

    });

    this.initScanner();
  }

  scannerEnabled = true;

  stopScanner() {
    this.scannerEnabled = false;
  }

  startScannerAgain() {
    this.scannerEnabled = true;
  }

  ////////////////////////////////////
  ///////// onScan ////////////// 
  ////////////////////////////////////

  async initScanner() {
    try {
      // 🔹 تحقق من إذن الكاميرا باستخدام Permissions API
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName });

      if (status.state === 'granted') {
        console.log('Camera permission already granted ✅');
        this.startScanner();  // افتح الـ scanner مباشرة
      }
      else if (status.state === 'prompt') {
        console.log('Camera permission not yet granted, asking user...');
        this.startScanner();  // المستخدم هيتطلب منه السماح، زي ما دلوقتي
      }
      else {
        Swal.fire({
          icon: 'error',
          title: '🚫 لا يوجد إذن للكاميرا',
          text: 'الرجاء السماح بالوصول إلى الكاميرا من إعدادات المتصفح'
        });
      }

      // 🔹 استمع لتغيير حالة الإذن لو حصل أي تعديل
      status.onchange = () => {
        console.log('Camera permission changed to', status.state);
      }

    } catch (err) {
      console.warn('Permissions API not supported, fallback to scanner init');
      this.startScanner();  // بعض المتصفحات القديمة لا تدعم Permissions API
    }
  }

  startScanner() {
    // هذا الكود موجود بالفعل في ngx-scanner
    // لا تحتاج تغييرات، مجرد استدعاء للـ scanner في الـ template
    console.log('Scanner is ready to use');
  }

  async onScan(result: string) {


    console.log('QR scanned:', result);
    this.stopScanner();

    const user = JSON.parse(localStorage.getItem('user')!);

    this._LockerService.scan({
      qrCode: result.trim(),
      supervisorId: user.id,
      status: 'Clean'
    }).subscribe({
      next: async (res: any) => {

        this.scannedLocker = {
          id: res.lockerId,
          qrCode: result.trim(),
          name: res.lockerName,
          floor: res.floor,
          lat: Number(res.lat),
          lng: Number(res.lng)
        };

        Swal.fire({
          title: '📍 جاري التحقق من الموقع',
          text: 'برجاء الانتظار...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // const isValid = await this.validateLocation();

        Swal.close();

        try {

          await this.validateLocation();

        } catch {

          console.log('Location validation skipped');

        }


        this.lastFocusedElement = document.activeElement as HTMLElement;
        // 🔥 فتح الـ Modal
        const modal = new bootstrap.Modal(document.getElementById('lockerModal'));
        modal.show();

      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: ' !خطأ',
          text: err.error?.message || 'خطأ في قراءة QR',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  ////////////////////////////////////
  ///////// getCurrentLocation ////////////// 
  ////////////////////////////////////

  getCurrentLocation(): Promise<{ lat: number, lng: number, accuracy: number }> {
    return new Promise((resolve, reject) => {

      const timeout = setTimeout(() => {
        reject('Timeout');
      }, 5000); // 10 ثواني

      navigator.geolocation.getCurrentPosition(

        (position) => {
          clearTimeout(timeout);

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },

        (error) => {
          clearTimeout(timeout);
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }

      );

    });
  }

  ////////////////////////////////////
  ///////// getAccurateLocation ////////////// 
  ////////////////////////////////////

  // 🟢 دالة للحصول على أفضل موقع من 3 محاولات
  // async getAccurateLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
  //   const attempts = 1;          // عدد القراءات
  //   const results: { lat: number; lng: number; accuracy: number }[] = [];

  //   for (let i = 0; i < attempts; i++) {
  //     try {
  //       const pos = await new Promise<{ lat: number; lng: number; accuracy: number }>((resolve, reject) => {
  //         navigator.geolocation.getCurrentPosition(
  //           (position) => resolve({
  //             lat: position.coords.latitude,
  //             lng: position.coords.longitude,
  //             accuracy: position.coords.accuracy
  //           }),
  //           (err) => reject(err),
  //           { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  //         );
  //       });
  //       results.push(pos);
  //     } catch (error) {
  //       console.warn('Geolocation attempt failed', error);
  //     }

  //     // انتظر نص ثانية قبل القراءة التالية
  //     await new Promise(res => setTimeout(res, 1000));
  //   }

  //   if (results.length === 0) {
  //     throw new Error('Unable to get location');
  //   }

  //   // اختار القراءة الأفضل (الأقل accuracy)
  //   results.sort((a, b) => a.accuracy - b.accuracy);
  //   return results[0];
  // }

  async getAccurateLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {

    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });

        },

        (err) => reject(err),

        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 10000
        }

      );

    });

  }


  ////////////////////////////////////
  ///////// getDistance ////////////// 
  ////////////////////////////////////


  getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;

    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // بالمتر
  }

  ///////////////////////////////////////////////
  ///////// validateLocation ////////////// 
  /////////////////////////////////////////

  async validateLocation(): Promise<boolean> {

    let userLocation;

    try {

      userLocation = await this.getAccurateLocation();

    } catch {

      // Swal.fire({
      //   icon: 'error',
      //   title: 'الموقع غير متاح',
      //   text: 'الرجاء السماح بالوصول إلى الموقع'
      // });

      this.warnAudio.play();

      return false;
    }

    if (userLocation.accuracy > 50) {

      // Swal.fire({
      //   icon: 'warning',
      //   title: '📡 GPS ضعيف',
      //   text: `دقة الموقع الحالية ${Math.round(userLocation.accuracy)} متر`
      // });

      return false;
    }

    const distance = this.getDistance(
      userLocation.lat,
      userLocation.lng,
      this.scannedLocker.lat,
      this.scannedLocker.lng
    );

    const allowedDistance =
      Math.max(30, userLocation.accuracy + 10);

    if (distance > allowedDistance) {

      // Swal.fire({
      //   icon: 'error',
      //   title: '🚫 بعيد جدا',
      //   text: `المسافة ${Math.round(distance)} متر`
      // });

      return false;
    }

    return true;
  }

  ////////////////////////////////////
  ///////// submitCheck ////////////// 
  ////////////////////////////////////

  async submitCheck() {

    // 🟢 3. بعد كل ده افتح الـ confirm
    const isNotClean = this.status === 'NotClean';
    const selectedItems = this.checklist
      .filter(x => x.checked)
      .map(x => x.name);

    const result = await Swal.fire({
      title: isNotClean ? '⚠️ !غير نظيف' : ' هل انت متأكد؟',
      text: isNotClean
        ? 'اللوكر ده مش نظيف. هل انت متأكد انك عاوز تأكد الفحص؟'
        : 'التاكيد؟',
      icon: isNotClean ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'تاكيد',
    });

    if (!result.isConfirmed) return;

    // 🟢 4. ابعت البيانات
    const user = JSON.parse(localStorage.getItem('user')!);
    this.loading = true;

    this._LockerService.saveLog({
      lockerId: this.scannedLocker.id,   // 🔥
      userId: user.id,                  // 🔥
      status: this.status,
      note: this.note,
      checklist: selectedItems.length ? selectedItems : []
    }).subscribe({
      next: () => {
        this.loading = false;

        this.successAudio.play();
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        const modalEl = document.getElementById('lockerModal');
        const modal = bootstrap.Modal.getInstance(modalEl);

        (document.activeElement as HTMLElement)?.blur();

        modal?.hide();

        // 🔥 الحل هنا
        setTimeout(() => {
          (document.activeElement as HTMLElement)?.blur();
          document.body.focus();
        }, 100);

        document.body.classList.remove('modal-open');

        const backdrops = document.getElementsByClassName('modal-backdrop');
        while (backdrops.length > 0) {
          backdrops[0].remove();
        }

        Swal.fire({
          icon: 'success',
          title: '✅ تم تسجيل الفحص',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {

          this.scannedLocker = null;
          this.note = '';
          this.status = 'Clean';
          this.checklist.forEach(x => x.checked = true);

          this.Router.navigate(['/dashboard']);

        });
      },
      error: (err: any) => {
        this.loading = false;

        if (err.status === 401) {

          Swal.fire({
            icon: 'warning',
            title: 'انتهت جلسة تسجيل الدخول',
            text: 'برجاء تسجيل الدخول مرة أخرى'
          }).then(() => {

            this.auth.logout();

            this.Router.navigate(['/login']);

          });

          return;
        }
      }
    });

    (document.activeElement as HTMLElement)?.blur();

    // اقفل المودال
    const modal = document.getElementById('lockerModal');
    const modalInstance = (window as any).bootstrap?.Modal.getInstance(modal);
    modalInstance?.hide();

    // تنظيف الباك دروب لو لزم
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  }
}