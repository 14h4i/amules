import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService, AdminStats } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats = {
    totalRevenue: 1825000,
    ordersCount: 2,
    productsCount: 16,
    usersCount: 3,
    vouchersCount: 2,
    pendingOrders: 1,
    completedOrders: 1,
    recentOrders: []
  };
  loading = true;

  constructor(
    private _adminService: AdminService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._cdr.markForCheck();
    this._adminService.getStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats = {
            ...this.stats,
            ...data,
            totalRevenue: data.totalRevenue !== undefined ? data.totalRevenue : this.stats.totalRevenue,
            ordersCount: data.ordersCount !== undefined ? data.ordersCount : this.stats.ordersCount,
            productsCount: data.productsCount !== undefined ? data.productsCount : this.stats.productsCount,
            usersCount: data.usersCount !== undefined ? data.usersCount : this.stats.usersCount,
            vouchersCount: data.vouchersCount !== undefined ? data.vouchersCount : this.stats.vouchersCount
          };
        }
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }
}
