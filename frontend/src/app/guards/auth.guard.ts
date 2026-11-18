import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Người dùng chưa đăng nhập -> Chuyển hướng tới trang đăng nhập (Chương IV - Guards)
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
