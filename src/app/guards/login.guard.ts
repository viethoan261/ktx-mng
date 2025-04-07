import { inject } from '@angular/core';
import { 
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard cho trang đăng nhập
 * Ngăn người dùng đã đăng nhập truy cập trang login
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Nếu người dùng đã đăng nhập, chuyển hướng đến trang chính (dashboard)
  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  // Người dùng chưa đăng nhập, cho phép truy cập trang đăng nhập
  return true;
}; 