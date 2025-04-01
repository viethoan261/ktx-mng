import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Kiểm tra trạng thái đăng nhập khi khởi động ứng dụng
    // if (!this.authService.isLoggedIn() && this.router.url !== '/login') {
    //   this.router.navigate(['/login']);
    // }
  }
}
