import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface User {
  id: number;
  username: string;
  fullname: string;
  role: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getStudents(): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.role === 'STUDENT'))
    );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getStudentsUnassigned(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + "/students/unassigned");
  }
} 