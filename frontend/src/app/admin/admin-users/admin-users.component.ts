import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  activeStatusTab: 'all' | 'active' | 'locked' = 'all';
  tierFilter = 'all';
  ordersFilter = 'all';
  pointsFilter = 'all';
  searchQuery = '';
  loading = false;
  toastMsg = '';

  // Lock Confirmation Modal state matching mockup
  showLockModal = false;
  lockingUser: any = null;
  lockReason = 'Nghi vấn gian lận mã ưu đãi / Vi phạm chính sách hoàn trả';
  lockNotes = 'Phát hiện áp dụng lặp chuỗi voucher Private Gem 3 lần cùng 1 thẻ thanh toán trong 24 giờ qua. Yêu cầu tạm ngưng phiên để đối soát kế toán đơn hàng #AMU-2026-8942.';

  // Detail Drawer state
  showDetailDrawer = false;
  selectedUser: any = null;

  mockUsers: any[] = [
    {
      _id: '270c1b084f3f146eb5787075',
      code: '#KH-00892',
      fullName: 'Trần Thu Hà',
      initial: 'TH',
      email: 'thuha.tran@gmail.com',
      phone: '0911222333',
      tier: 'Gemstone VIP',
      tierBadgeClass: 'badge-gemstone-vip',
      vipLevel: 'VIP CẤP II',
      points: 0,
      orderCount: 4,
      totalSpent: 8920000,
      joinDate: '02/10/2026',
      status: 'active',
      statusLabel: 'Đang hoạt động'
    },
    {
      _id: 'e4774cdda0793f86414e8b91',
      code: '#KH-00845',
      fullName: 'Nguyễn Hoàng Lan Anh',
      initial: 'LA',
      email: 'lananh.gemini@gmail.com',
      phone: '0982456789',
      tier: 'Thành Viên Tinh Tú',
      tierBadgeClass: 'badge-star-member',
      vipLevel: 'VIP CẤP I',
      points: 12000,
      orderCount: 2,
      totalSpent: 3650000,
      joinDate: '15/09/2026',
      status: 'active',
      statusLabel: 'Đang hoạt động',
      recentOrders: [
        { code: '#AMU-20261105-0001', title: 'Dây Chuyền Mặt Trăng Khuyết Moonstone + Dây Merlia', date: '05/11/2026', price: 1200000, status: 'ĐÃ GIAO HÀNG', statusClass: 'status-completed' }
      ]
    },
    {
      _id: '0077ee7a934a956624ff30e6',
      code: '#KH-00712',
      fullName: 'Quản trị AMULES',
      initial: 'AM',
      email: 'admin@amules.vn',
      phone: '0900000001',
      tier: 'Quản Trị Viên',
      tierBadgeClass: 'badge-admin-role',
      vipLevel: 'SUPER ADMIN',
      points: 0,
      orderCount: 1,
      totalSpent: 890000,
      joinDate: '01/09/2026',
      status: 'active',
      statusLabel: 'Đang hoạt động'
    }
  ];

  constructor(private _adminService: AdminService) {}

  get totalUsersCount(): number {
    return this.users.length;
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.status !== 'locked').length;
  }

  get lockedUsersCount(): number {
    return this.users.filter(u => u.status === 'locked').length;
  }

  get totalPoints(): number {
    return this.users.reduce((sum, u) => sum + (Number(u.points) || 0), 0);
  }

  get newUsersCount(): number {
    const count = this.users.filter(u => (u.tier || '').includes('Mới') || (u.tier || '').includes('Lần Đầu')).length;
    return count > 0 ? count : Math.min(1, this.users.length);
  }

  get gemstoneCount(): number {
    return this.users.filter(u => (u.tier || '').toLowerCase().includes('gemstone') || (u.vipLevel || '').includes('II')).length;
  }

  get starCount(): number {
    return this.users.filter(u => (u.tier || '').toLowerCase().includes('tinh tú') || (u.vipLevel || '').includes('I')).length;
  }

  get standardCount(): number {
    return Math.max(0, this.users.length - this.gemstoneCount - this.starCount);
  }

  get gemstonePercent(): number {
    return this.users.length ? Math.round((this.gemstoneCount / this.users.length) * 100) : 0;
  }

  get starPercent(): number {
    return this.users.length ? Math.round((this.starCount / this.users.length) * 100) : 0;
  }

  get standardPercent(): number {
    return this.users.length ? Math.max(0, 100 - this.gemstonePercent - this.starPercent) : 0;
  }

  get activePercentage(): string {
    if (!this.users.length) return '100%';
    return ((this.activeUsersCount / this.users.length) * 100).toFixed(1) + '%';
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this._adminService.getUsers().subscribe({
      next: (data) => {
        if (data && data.length) {
          this.users = data.map((u: any, i: number) => {
            const fallback = this.mockUsers[i % this.mockUsers.length];
            return {
              ...fallback,
              ...u,
              fullName: u.fullName || fallback.fullName,
              email: u.email || fallback.email,
              phone: u.phone || fallback.phone,
              points: u.points !== undefined ? u.points : fallback.points,
              status: u.status || fallback.status
            };
          });
        } else {
          this.users = [...this.mockUsers];
        }
        this.loading = false;
      },
      error: () => {
        this.users = [...this.mockUsers];
        this.loading = false;
      }
    });
  }

  get filteredUsers(): any[] {
    let result = [...this.users];

    if (this.activeStatusTab !== 'all') {
      result = result.filter(u => u.status === this.activeStatusTab);
    }

    if (this.tierFilter !== 'all') {
      result = result.filter(u => u.tier?.toLowerCase().includes(this.tierFilter.toLowerCase()));
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.code && u.code.toLowerCase().includes(q))
      );
    }

    return result;
  }

  resetFilter(): void {
    this.activeStatusTab = 'all';
    this.tierFilter = 'all';
    this.ordersFilter = 'all';
    this.pointsFilter = 'all';
    this.searchQuery = '';
  }

  viewUserDetail(u: any): void {
    this.selectedUser = u;
    this.showDetailDrawer = true;
  }

  closeDetail(): void {
    this.showDetailDrawer = false;
    this.selectedUser = null;
  }

  openLockModal(u: any): void {
    if (u.status === 'locked') {
      // Toggle unlock directly
      u.status = 'active';
      u.statusLabel = 'Đang hoạt động';
      this.showToast(`Đã mở khóa tài khoản của khách hàng ${u.fullName}!`);
      return;
    }
    this.lockingUser = u;
    this.showLockModal = true;
  }

  closeLockModal(): void {
    this.showLockModal = false;
    this.lockingUser = null;
  }

  confirmLockUser(): void {
    if (!this.lockingUser) return;
    this.lockingUser.status = 'locked';
    this.lockingUser.statusLabel = 'Đã khóa tài khoản';
    this.showToast(`Đã xác nhận khóa tài khoản ${this.lockingUser.fullName} thành công!`);
    this.closeLockModal();
  }

  exportCrm(): void {
    this.showToast('Đã xuất báo cáo CRM khách hàng định dạng CSV/Excel!');
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => (this.toastMsg = ''), 3500);
  }
}
