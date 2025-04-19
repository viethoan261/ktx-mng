import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Price } from '../models/price.model';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  private apiUrl = `${environment.apiUrl}/Price`;

  constructor(private http: HttpClient) { }

  /**
   * Get all prices
   */
  getPrices(): Observable<Price[]> {
    return this.http.get<Price[]>(this.apiUrl);
  }

  /**
   * Create a new price
   */
  createPrice(price: Price): Observable<Price> {
    return this.http.post<Price>(this.apiUrl, price);
  }
} 