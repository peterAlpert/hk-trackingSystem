import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LockerService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  scan(data: { qrCode: string; supervisorId: number; status: string, note?: string }) {
    return this.http.post(`${this.baseUrl}/check/scan`, data);
  }

  saveLog(data: { lockerId: number; userId: number; status: string; note?: string, checklist?: any[] }) {
    console.log(data);
    return this.http.post(`${this.baseUrl}/check/saveLog`, data);
  }

  getAllChecks() {
    return this.http.get(`${this.baseUrl}/check/all`);
  }

  getChecksByBuilding(buildingId: number) {
    return this.http.get(`${this.baseUrl}/check/byBuilding/${buildingId}`);
  }

  getLockerById(id: number) {
    return this.http.get(`${this.baseUrl}/locker/byLockerId?lockerId=${id}`);
  }

  updateCheckStatus(checkId: number, status: number) {
    return this.http.put(`${this.baseUrl}/check/updateStatus/${checkId}`, { status });
  }

  getAllLockers() {
    return this.http.get(
      `${environment.baseUrl}/Locker/all-lockers`
    );
  }

  updateLocation(data: any) {

    return this.http.put(

      `${environment.baseUrl}/Locker/update-location`,

      data

    );

  }

}
