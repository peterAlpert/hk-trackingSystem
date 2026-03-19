import { Router } from '@angular/router';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { LockerService } from '../../services/locker.service';
import Swal from 'sweetalert2';
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


  constructor(
    private _LockerService: LockerService,
    private Router: Router
  ) { }

  ngAfterViewInit() {
    const modalEl = document.getElementById('lockerModal');

    modalEl?.addEventListener('hidden.bs.modal', () => {
      (document.activeElement as HTMLElement)?.blur();
      document.body.focus();
    });
  }

  ////////////////////////////////////
  ///////// onScan ////////////// 
  ////////////////////////////////////

  onScan(result: string) {
    console.log('QR scanned:', result);

    const user = JSON.parse(localStorage.getItem('user')!);

    this._LockerService.scan({
      qrCode: result.trim(),
      supervisorId: user.id,
      status: 'Clean'
    }).subscribe({
      next: (res: any) => {

        this.scannedLocker = {
          qrCode: result.trim(),
          name: res.lockerName,
          floor: res.floor,
          lat: Number(res.lat),
          lng: Number(res.lng)
        };

        console.log(typeof this.scannedLocker.lat);
        console.log(typeof this.scannedLocker.lng);


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
      }, 10000); // 10 ثواني

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
          timeout: 10000,
          maximumAge: 0
        }

      );

    });
  }

  ////////////////////////////////////
  ///////// getAccurateLocation ////////////// 
  ////////////////////////////////////

  // 🟢 دالة للحصول على أفضل موقع من 3 محاولات
  async getAccurateLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
    const attempts = 3;          // عدد القراءات
    const results: { lat: number; lng: number; accuracy: number }[] = [];

    for (let i = 0; i < attempts; i++) {
      try {
        const pos = await new Promise<{ lat: number; lng: number; accuracy: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
        results.push(pos);
      } catch (error) {
        console.warn('Geolocation attempt failed', error);
      }

      // انتظر نص ثانية قبل القراءة التالية
      await new Promise(res => setTimeout(res, 500));
    }

    if (results.length === 0) {
      throw new Error('Unable to get location');
    }

    // اختار القراءة الأفضل (الأقل accuracy)
    results.sort((a, b) => a.accuracy - b.accuracy);
    return results[0];
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


  ////////////////////////////////////
  ///////// submitCheck ////////////// 
  ////////////////////////////////////

  async submitCheck() {

    let userLocation;

    // 🟢 1. هات الموقع الأول
    try {
      // userLocation = await this.getCurrentLocation();
      userLocation = await this.getAccurateLocation();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'الموقع غير متاح',
        text: 'الرجاء السماح بالوصول إلى الموقع والمحاولة مرة أخرى'
      });
      this.warnAudio.play();
      return;
    }
    console.log('Locker:', this.scannedLocker);
    console.log('User:', userLocation);

    console.log('Location:', userLocation);

    // ❌ لو GPS ضعيف
    if (userLocation.accuracy > 200) {
      Swal.fire({
        icon: 'warning',
        title: '📡 ضعيف GPS',
        text: 'الرجاء التأكد من تشغيل GPS لتحسين الدقة'
      });
      this.warnAudio.play();
      return;
    }

    // 🟢 2. احسب المسافة
    const distance = this.getDistance(
      userLocation.lat,
      userLocation.lng,
      this.scannedLocker.lat,
      this.scannedLocker.lng
    );

    console.log('Distance:', distance);

    const allowedDistance = Math.max(10, userLocation.accuracy);

    console.log('Allowed Distance:', allowedDistance);

    if (distance > allowedDistance) {
      Swal.fire({
        icon: 'error',
        title: '🚫 بعيد جدا',
        text: `المسافه تبعد عن الموقع: ${Math.round(distance)}م`
      });
      this.warnAudio.play();
      return;
    }

    // 🟢 3. بعد كل ده افتح الـ confirm
    const isNotClean = this.status === 'NotClean';

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
      qrCode: this.scannedLocker.qrCode,
      supervisorId: user.id,
      status: this.status,
      note: this.note
    }).subscribe({
      next: () => {
        this.loading = false;

        this.successAudio.play();
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        Swal.fire({
          icon: 'success',
          title: '✅ تم تسجيل الفحص',
          timer: 2000,
          showConfirmButton: false
        });

        const modalEl = document.getElementById('lockerModal');
        const modal = bootstrap.Modal.getInstance(modalEl);

        modal.hide();

        // 🔥 الحل هنا
        setTimeout(() => {
          (document.activeElement as HTMLElement)?.blur();
          document.body.focus();
        }, 100);

        this.scannedLocker = null;
        this.Router.navigate(['/checks']);
      },
      error: () => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: '!خطأ',
          text: 'خطأ عند إرسال الفحص'
        });
      }
    });
  }
}