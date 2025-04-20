import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface RoomStatistics {
  StatusCounts: {
    OCCUPIED: number;
    AVAILABLE?: number;
    MAINTENANCE?: number;
    RESERVED?: number;
  };
  RoomsOccupancy: {
    RoomId: number;
    RoomNumber: string;
    FloorNumber: string;
    Status: string;
    MaxOccupancy: number;
    CurrentOccupancy: number;
  }[];
}

export interface BillStatistics {
  MonthlyStatistics: {
    Month: number;
    TotalBills: number;
    PaidBills: number;
    UnpaidBills: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getRoomStatistics(): Observable<RoomStatistics> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<RoomStatistics>(`${this.apiUrl}/Statistics/rooms`, { headers });
  }
  
  getBillStatistics(year: number): Observable<BillStatistics> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<BillStatistics>(`${this.apiUrl}/Statistics/bills`, {
      headers,
      params: { year: year.toString() }
    });
  }
} 