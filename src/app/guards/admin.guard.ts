import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Lấy thông tin user từ localStorage
  const userInfoString = localStorage.getItem('user_info');
  if (!userInfoString) {
    // Nếu không có thông tin user, không cho phép truy cập
    // Chuyển hướng đến trang đăng nhập hoặc dashboard tùy logic
    console.warn('Admin Guard: No user info found in localStorage. Redirecting to login.');
    return router.createUrlTree(['/login']);
  }

  try {
    const userInfo = JSON.parse(userInfoString);
    // Kiểm tra xem người dùng có role 'ADMIN' không
    if (userInfo?.role === 'ADMIN') {
      // Nếu là ADMIN, cho phép truy cập route
      return true;
    } else {
      // Nếu không phải ADMIN, không cho phép truy cập
      console.warn(`Admin Guard: User role is "${userInfo?.role}". Access denied. Redirecting to dashboard.`);
      // Chuyển hướng về trang dashboard (hoặc trang mặc định khác)
      return router.createUrlTree(['/dashboard']);
    }
  } catch (error) {
    // Xử lý lỗi nếu không parse được JSON từ localStorage
    console.error('Admin Guard: Error parsing user info from localStorage.', error);
    // Chuyển hướng đến trang đăng nhập khi có lỗi
    return router.createUrlTree(['/login']);
  }
}; 