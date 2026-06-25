import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StockService {


  baseUrl = environment.baseUrl + '/stock';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(this.baseUrl);
  }

  add(item: any) {
    return this.http.post(this.baseUrl, item);
  }

  increase(id: number) {
    return this.http.put(`${this.baseUrl}/increase/${id}`, {});
  }

  decrease(id: number) {
    return this.http.put(`${this.baseUrl}/decrease/${id}`, {});
  }

  updateQuantity(id: number, quantity: number) {
    return this.http.put(`${this.baseUrl}/updateQuantity/${id}`, quantity);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
