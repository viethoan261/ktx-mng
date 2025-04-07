import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  returnUrl: string = '/dashboard'; // Mặc định chuyển đến dashboard

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Lấy returnUrl từ query params nếu có
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Kiểm tra nếu đã đăng nhập thì chuyển đến returnUrl hoặc dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.loginError = '';
      
      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response && response.token) {
            // Lưu token
            this.authService.saveToken(response.token);
            
            // Chuyển đến trang đã định hoặc dashboard
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.loginError = 'Đăng nhập thất bại, vui lòng thử lại';
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loginError = error.error?.message || 'Đăng nhập thất bại, vui lòng thử lại';
        }
      });
    }
  }
}
