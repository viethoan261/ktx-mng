import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Request {
  id: number;
  studentId: number;
  studentName: string;
  title: string;
  content: string;
  type: string;
  status: string;
  response: string | null;
  createdDate: string;
  modifiedDate: string;
  resolvedDate: string | null;
}

export interface RequestResponse {
  response: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/Requests`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getRequests(): Observable<Request[]> {
    if (this.authService.isAdmin()) {
      return this.http.get<Request[]>(this.apiUrl);
    } else {
      return this.http.get<Request[]>(`${this.apiUrl}/my-requests`);
    }
  }

  getRequestById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }

  createRequest(request: Partial<Request>): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    // If we're updating status and providing a response, use the respond endpoint
    if (request.status && request.response !== undefined) {
      return this.respondToRequest(id, {
        status: request.status,
        response: request.response || ''  // Convert null to empty string
      });
    }
    // Otherwise use the regular update endpoint
    return this.http.put<Request>(`${this.apiUrl}/${id}`, request);
  }

  respondToRequest(id: number, response: RequestResponse): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}/respond`, response);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 