import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  if (adminService.isAdminLoggedIn()) {
    return true;
  }

  // Chưa đăng nhập Admin -> Chuyển về trang đăng nhập quản trị
  router.navigate(['/admin/login']);
  return false;
};
