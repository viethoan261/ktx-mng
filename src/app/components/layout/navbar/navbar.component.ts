import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // Thông tin người dùng
  userFullName: string = 'Người dùng';
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    // Lấy thông tin trực tiếp từ localStorage
    const userInfoString = localStorage.getItem('user_info');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        
        // Thử sử dụng cả fullName và fullname (tùy theo cách lưu)
        this.userFullName = userInfo.fullName || userInfo.fullname || 'Người dùng';
        
        // Thử decode UTF-8 nếu chuỗi bị mã hóa sai
        if (this.userFullName.includes('áº£') || this.userFullName.includes('á»')) {
          try {
            this.userFullName = decodeURIComponent(escape(this.userFullName));
          } catch (decodeError) {
            console.error('UTF-8 decode error:', decodeError);
          }
        }
        
        this.userRole = userInfo.role || '';
      } catch (error) {
        console.error('Error parsing user info:', error);
        this.userFullName = 'Người dùng';
      }
    }
  }

  // Phương thức đăng xuất
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
