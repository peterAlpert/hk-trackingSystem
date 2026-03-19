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

  saveLog(data: { qrCode: string; supervisorId: number; status: string; note?: string }) {
    return this.http.post(`${this.baseUrl}/check/saveLog`, data);
  }

  getAllChecks() {
    return this.http.get(`${this.baseUrl}/check/all`);
  }

}
