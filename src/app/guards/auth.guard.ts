import { Injectable, inject } from '@angular/core';
import { 
  CanActivateFn,
  Router,
  UrlTree 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard bảo vệ route yêu cầu xác thực
 * Chuyển sang functional guard theo khuyến nghị của Angular
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Kiểm tra người dùng đã đăng nhập chưa
  if (authService.isLoggedIn()) {
    // Người dùng đã đăng nhập, cho phép truy cập
    return true;
  }

  // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
  // Ghi nhớ URL mà người dùng đang cố truy cập để chuyển hướng sau khi đăng nhập
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}; 