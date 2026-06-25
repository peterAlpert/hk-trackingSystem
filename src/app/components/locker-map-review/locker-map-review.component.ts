import { Component } from '@angular/core';
import { LockerService } from '../../services/locker.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-locker-map-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './locker-map-review.component.html',
  styleUrl: './locker-map-review.component.css'
})
export class LockerMapReviewComponent {

  lockers: any[] = [];

  constructor(
    private _LockerService: LockerService
  ) { }

  ngOnInit() {

    this._LockerService.getAllLockers().subscribe({

      next: (res: any) => {

        this.lockers = res;

      }

    });

  }

  openMap(locker: any) {

    window.open(

      `https://www.google.com/maps?q=${locker.latitude},${locker.longitude}`,

      '_blank'

    );

  }

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
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
        });
        results.push(pos);
      } catch (error) {
        console.warn('Geolocation attempt failed', error);
      }

      // انتظر نص ثانية قبل القراءة التالية
      await new Promise(res => setTimeout(res, 3000));
    }

    if (results.length === 0) {
      throw new Error('Unable to get location');
    }

    // اختار القراءة الأفضل (الأقل accuracy)
    results.sort((a, b) => a.accuracy - b.accuracy);
    return results[0];
  }

  async fixLocation(locker: any) {

    const location = await this.getAccurateLocation();

    this._LockerService.updateLocation({

      lockerId: locker.id,

      latitude: location.lat,

      longitude: location.lng

    }).subscribe({

      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'تم تحديث الإحداثيات'
        });

      }

    });

  }

}
