import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Order`;

  constructor(private http: HttpClient) { }

  /**
   * Get all orders
   */
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl} `);
  }

  /**
   * Create orders for the previous month
   */
  createOrders(orderRequest: OrderRequest): Observable<any> {
    return this.http.post(this.apiUrl, orderRequest);
  }


  /**
   * Update order status
   */
  updateOrderStatus(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/markAsPaid`, {});
  }

  getStudentOrders(studentId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/student/${studentId}`);
  }
} 