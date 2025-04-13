import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Import environment

// Định nghĩa interface cho response login
interface LoginResponse {
  token: string;
}

// Định nghĩa interface cho thông tin user sau khi decode token
interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  role: string;
  // Thêm các trường khác nếu cần
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_INFO_KEY = 'user_info';

  // Subject để thông báo trạng thái đăng nhập
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  public loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) { }

  // Kiểm tra token
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Tạo HTTP header có token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    });
  }

  // Login với username thay vì email
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Users/login`, { username, password })
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  // Lưu token và decode để lấy thông tin user
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // Decode token và lưu thông tin user
    const userInfo = this.decodeToken(token);
    if (userInfo) {
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    }
    
    // Cập nhật trạng thái đăng nhập
    this.loggedIn.next(true);
  }

  // Giải mã JWT token
  private decodeToken(token: string): UserInfo | null {
    try {
      // Phần payload của JWT là phần thứ 2, cách nhau bởi dấu "."
      const payload = token.split('.')[1];
      // Decode base64
      const decodedPayload = window.atob(payload);
      // Parse JSON
      const userData = JSON.parse(decodedPayload);
      
      // Thêm xử lý để decode UTF-8 cho các trường chuỗi
      const fullname = this.decodeUTF8String(userData.fullname || '');
      
      return {
        id: userData.id,
        username: userData.username,
        fullName: fullname, // Đã decode
        role: userData.role
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  // Phương thức hỗ trợ để decode chuỗi UTF-8
  private decodeUTF8String(str: string): string {
    try {
      // Nếu chuỗi không cần decode (đã hiển thị đúng), trả về nguyên bản
      if (/^[\x00-\x7F]*$/.test(str)) return str;
      
      // Đối với các chuỗi có ký tự không phải ASCII, thử decode UTF-8
      return decodeURIComponent(escape(str));
    } catch (e) {
      console.error('Error decoding UTF-8 string:', e);
      return str; // Trả về chuỗi gốc nếu có lỗi
    }
  }

  // Đăng xuất
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    this.loggedIn.next(false);
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  // Lấy thông tin người dùng hiện tại
  getCurrentUser(): UserInfo | null {
    const userJson = localStorage.getItem(this.USER_INFO_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as UserInfo;
  }
  
  // Kiểm tra người dùng có quyền admin không
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}
