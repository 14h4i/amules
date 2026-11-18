import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  navItems = [
    { label: 'Tổng quan', icon: 'grid', route: '/admin/dashboard' },
    { label: 'Sản phẩm', icon: 'gem', route: '/admin/products' },
    { label: 'Danh mục & Bộ sưu tập', icon: 'layers', route: '/admin/catalog' },
    { label: 'Đơn hàng', icon: 'package', route: '/admin/orders' },
    { label: 'Khách hàng', icon: 'user', route: '/admin/users' },
    { label: 'Khuyến mãi & Voucher', icon: 'sparkle', route: '/admin/vouchers' },
    { label: 'Quản lý nội dung', icon: 'book-open', route: '/admin/content' }
  ];

  adminName = 'Vũ Hoàng Linh';
  adminRole = 'QUẢN TRỊ VIÊN';
  adminInitial = 'VL';

  constructor(
    public adminService: AdminService,
    private _router: Router
  ) {
    const admin = this.adminService.currentAdmin();
    if (admin && admin.fullName) {
      this.adminName = admin.fullName;
      const parts = admin.fullName.trim().split(' ');
      this.adminInitial = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    }
  }

  onLogout(): void {
    this.adminService.logout();
    this._router.navigate(['/admin/login']);
  }
}
