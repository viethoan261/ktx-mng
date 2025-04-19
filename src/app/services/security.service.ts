import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Security } from '../models/security';
import { environment } from '../../environments/environment';

export interface CheckInRequest {
  visitorName: string;
  phoneNumber: string;
  studentId: number | string;
  purpose: string;
  notes?: string;
}

export interface CheckOutRequest {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private apiUrl = `${environment.apiUrl}/SecurityVisits`;

  constructor(private http: HttpClient) { }

  getSecurityRecords(): Observable<Security[]> {
    return this.http.get<Security[]>(`${this.apiUrl}`);
  }

  getSecurityRecord(id: number): Observable<Security> {
    return this.http.get<Security>(`${this.apiUrl}/${id}`);
  }

  checkIn(data: CheckInRequest): Observable<Security> {
    return this.http.post<Security>(`${this.apiUrl}/checkin`, data);
  }

  checkOut(id: number): Observable<Security> {
    return this.http.put<Security>(`${this.apiUrl}/${id}/checkout`, {});
  }

  updateSecurityRecord(id: number, data: Partial<CheckInRequest>): Observable<Security> {
    return this.http.put<Security>(`${this.apiUrl}/${id}`, data);
  }

  deleteSecurityRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
