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

  defaultRecentOrders = [
    { code: '#AMU-20261105-0001', title: 'Dây Chuyền Mặt Trăng Khuyết Moonstone + Dây Merlia', date: '05/11/2026', price: 1200000, status: 'ĐÃ GIAO HÀNG', statusClass: 'status-completed' }
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

  formatUser(u: any, index: number): any {
    const id = u.id || u._id;
    const fullName = u.fullName || u.username || 'Khách hàng AMULES';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0].toUpperCase())
      .slice(-2)
      .join('') || 'KH';

    const tier = u.tier || (u.role === 'admin' ? 'Quản Trị Viên' : 'Thành viên mới');
    let tierBadgeClass = 'badge-member';
    if (tier.toLowerCase().includes('gemstone') || tier.includes('VIP')) {
      tierBadgeClass = 'badge-gemstone-vip';
    } else if (tier.toLowerCase().includes('tinh tú')) {
      tierBadgeClass = 'badge-star-member';
    } else if (u.role === 'admin') {
      tierBadgeClass = 'badge-admin-role';
    }

    let joinDate = 'Hôm nay';
    if (u.createdAt) {
      try {
        const d = new Date(u.createdAt);
        joinDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      } catch (e) {}
    }

    return {
      _id: id,
      id: id,
      code: u.code || `#KH-${String(index + 1).padStart(4, '0')}`,
      fullName,
      initial: initials,
      email: u.email || 'khachhang@amules.vn',
      phone: u.phone || 'Chưa cập nhật',
      tier,
      tierBadgeClass,
      vipLevel: u.vipLevel || (tier.includes('VIP') ? 'VIP CẤP II' : (u.role === 'admin' ? 'SUPER ADMIN' : 'THÀNH VIÊN')),
      points: Number(u.points || 0),
      orderCount: Number(u.orderCount || (u.orders ? u.orders.length : 0)),
      totalSpent: Number(u.totalSpent || 0),
      joinDate,
      status: u.status || 'active',
      statusLabel: u.status === 'locked' ? 'Đã khóa' : 'Đang hoạt động',
      recentOrders: u.recentOrders || []
    };
  }

  loadUsers(): void {
    this.loading = true;
    this._adminService.getUsers().subscribe({
      next: (data) => {
        if (data && data.length) {
          this.users = data.map((u: any, i: number) => this.formatUser(u, i));
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('loadUsers error:', err);
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
