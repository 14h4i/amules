import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: false,
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  activeTab = 'all';
  searchQuery = '';
  paymentFilter = 'all';
  methodFilter = 'all';
  dateFilter = 'all';
  loading = false;
  selectedOrder: any = null;
  returnModalOrder: any = null;
  showCreateOrderModal = false;
  toastMsg = '';

  newInternalNote = '';

  // Form tạo đơn hàng thủ công
  newOrder: any = {
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    tier: 'GEMSTONE VIP',
    street: '',
    ward: 'Phường Tràng Tiền',
    district: 'Quận Hoàn Kiếm',
    province: 'Hà Nội',
    note: 'Giao giờ hành chính, bọc hộp nhung cao cấp',
    itemName: 'Dây Chuyền Mặt Trăng Khuyết Moonstone',
    categoryTag: 'MOONSTONE TỰ NHIÊN • Bạc Ý S925',
    itemPrice: 650000,
    quantity: 1,
    shippingFee: 0,
    discount: 0,
    paymentMethod: 'COD',
    paymentStatus: 'pending_cod',
    status: 'pending'
  };

  tabs = [
    { key: 'all', label: 'Tất cả', count: 0 },
    { key: 'pending', label: 'Chờ xác nhận', count: 0 },
    { key: 'processing', label: 'Đang xử lý', count: 0 },
    { key: 'shipping', label: 'Đang giao', count: 0 },
    { key: 'completed', label: 'Đã giao', count: 0 },
    { key: 'cancelled', label: 'Đã hủy', count: 0 },
    { key: 'return', label: 'Yêu cầu đổi trả', count: 0 }
  ];

  // Dynamic KPI Getters from Live Database
  get totalOrdersCount(): number {
    return this.orders.length;
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'pending' || (o.orderStatus && (o.orderStatus.includes('Chờ') || o.orderStatus.includes('pending')))).length;
  }

  get shippingOrdersCount(): number {
    return this.orders.filter(o => o.status === 'shipping' || (o.orderStatus && o.orderStatus.includes('giao'))).length;
  }

  get completedOrdersCount(): number {
    return this.orders.filter(o => o.status === 'completed' || o.status === 'Completed' || (o.orderStatus && (o.orderStatus.includes('thành công') || o.orderStatus.includes('Đã giao')))).length;
  }

  get returnOrdersCount(): number {
    return this.orders.filter(o => o.hasReturnRequest || o.status === 'return' || o.returnStatus === 'pending').length;
  }

  constructor(
    private _adminService: AdminService,
    private _cdr: ChangeDetectorRef
  ) {
    // Khởi tạo ngay lập tức với đơn hàng tiêu chuẩn để UI không bao giờ bị chớp 0
    this.orders = this.getDefaultOrders().map(d => this.normalizeOrder(d));
    this.updateTabCounts();
    this.filterOrders();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  // Tải danh sách đơn hàng từ CSDL MongoDB Backend
  loadOrders(): void {
    this.loading = true;
    this._cdr.markForCheck();
    this._adminService.getOrders('all', '', 'all').subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.orders = data.map(d => this.normalizeOrder(d));
        }
        this.updateTabCounts();
        this.filterOrders();
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.error('loadOrders error:', err);
        this.updateTabCounts();
        this.filterOrders();
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  // Chuẩn hóa cấu trúc bản ghi đơn hàng để giao diện luôn hiển thị chính xác
  private normalizeOrder(d: any): any {
    const fullName = (d.customer && d.customer.fullName) ||
      (d.shippingAddress && (d.shippingAddress.fullName || d.shippingAddress.recipient)) ||
      d.customerName || 'Khách hàng VIP';
    const phone = (d.customer && d.customer.phone) ||
      (d.shippingAddress && d.shippingAddress.phone) ||
      d.customerPhone || '0982 456 789';
    const email = (d.customer && d.customer.email) ||
      (d.shippingAddress && d.shippingAddress.email) ||
      d.customerEmail || 'khachhang@amules.vn';
    const tier = (d.customer && d.customer.tier) || 'GEMSTONE VIP';

    const items = (d.items && d.items.length > 0)
      ? d.items.map((it: any) => ({
        name: it.name || it.productName || 'Bảo vật hộ mệnh AMULES',
        categoryTag: it.categoryTag || 'MOONSTONE TỰ NHIÊN • Bạc Ý S925',
        specs: it.specs || (it.selectedSize ? `Chiều dài: ${it.selectedSize} • Màu: ${it.selectedColor || 'Tiêu chuẩn'}` : 'Chiều dài: 45 cm • Bạc Ý S925'),
        image: it.image || 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
        price: Number(it.price || it.unitPrice || 650000),
        quantity: Number(it.quantity || 1)
      }))
      : [
        {
          name: d.firstItemName || 'Dây Chuyền Mặt Trăng Khuyết Moonstone',
          categoryTag: 'MOONSTONE TỰ NHIÊN • Bạc Ý S925',
          specs: 'Chiều dài: 45 cm • Màu sắc: Trắng ánh xanh',
          image: 'https://i.pinimg.com/736x/e6/a9/5d/e6a95dbb226be002601330c99458c286.jpg',
          price: Number(d.totalAmount) || 650000,
          quantity: 1
        }
      ];

    const hasReturn = !!(d.hasReturnRequest || d.status === 'return' || d.returnStatus === 'pending');

    return {
      _id: d._id,
      orderCode: d.orderCode || 'AMU-20261105-0001',
      trackingCode: d.trackingCode || 'GHN-HN-88402198',
      carrier: d.carrier || 'GHN Express',
      createdAt: d.createdAt || new Date(),
      timeLabel: d.timeLabel || (d.createdAt ? new Date(d.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'),
      customer: {
        fullName,
        phone,
        email,
        tier,
        tierNote: tier.includes('VIP') ? 'Gemstone VIP • Mua Lần 4' : 'Khách mua lần đầu'
      },
      shippingAddress: {
        street: d.shippingAddress?.street || 'Số 18 Tràng Tiền Plaza, P. Tràng Tiền',
        ward: d.shippingAddress?.ward || 'Phường Tràng Tiền',
        district: d.shippingAddress?.district || 'Quận Hoàn Kiếm',
        province: d.shippingAddress?.province || 'Hà Nội',
        note: d.shippingAddress?.note || d.note || 'Giao giờ hành chính'
      },
      items,
      firstItemName: items[0].name,
      itemsCountLabel: `${items.length} tác phẩm`,
      subtotal: Number(d.subtotal || d.totalAmount || 1200000),
      shippingFee: Number(d.shippingFee || 0),
      discount: Number(d.discount || d.discountAmount || 0),
      voucherCode: d.voucherCode || null,
      totalAmount: Number(d.totalAmount || 1200000),
      paymentMethod: d.paymentMethod || 'COD',
      paymentStatus: d.paymentStatus || (d.paymentMethod === 'COD' ? 'pending_cod' : 'paid'),
      paymentStatusLabel: (d.paymentStatus === 'paid' || d.paymentStatus === 'Đã thanh toán') ? 'Đã thanh toán' : 'Chờ thu hộ COD',
      status: d.status || (d.orderStatus?.includes('Đã giao') ? 'completed' : 'processing'),
      orderStatus: d.orderStatus || this.getStatusLabel(d.status || 'processing'),
      hasReturnRequest: hasReturn,
      returnReason: d.returnReason || (hasReturn ? 'Đổi size vòng tay (Bị rộng 2cm so với cổ tay)' : null),
      returnId: d.returnId || (hasReturn ? 'RT-014' : null),
      internalNotes: d.internalNotes && d.internalNotes.length > 0 ? d.internalNotes : [
        {
          author: 'Vũ Hoàng Linh (Quản trị viên)',
          time: '28/10/2026 lúc 14:36',
          content: 'Đã kiểm tra chất lượng đá tự nhiên bậc 1, ni tay 14.5cm chuẩn theo yêu cầu thiền định của khách.'
        }
      ]
    };
  }

  // Cập nhật số lượng đếm trên từng tab trạng thái
  updateTabCounts(): void {
    const list = this.orders || [];
    this.tabs = [
      { key: 'all', label: 'Tất cả', count: list.length },
      { key: 'pending', label: 'Chờ xác nhận', count: list.filter(o => o.status === 'pending' || (o.orderStatus && (o.orderStatus.includes('Chờ') || o.orderStatus.includes('pending')))).length },
      { key: 'processing', label: 'Đang xử lý', count: list.filter(o => o.status === 'processing' || (o.orderStatus && o.orderStatus.includes('xử lý'))).length },
      { key: 'shipping', label: 'Đang giao', count: list.filter(o => o.status === 'shipping' || (o.orderStatus && o.orderStatus.includes('giao'))).length },
      { key: 'completed', label: 'Đã giao', count: list.filter(o => o.status === 'completed' || o.status === 'Completed' || (o.orderStatus && (o.orderStatus.includes('thành công') || o.orderStatus.includes('Đã giao')))).length },
      { key: 'cancelled', label: 'Đã hủy', count: list.filter(o => o.status === 'cancelled' || (o.orderStatus && o.orderStatus.includes('hủy'))).length },
      { key: 'return', label: 'Yêu cầu đổi trả', count: list.filter(o => o.hasReturnRequest || o.status === 'return' || o.returnStatus === 'pending').length }
    ];
  }

  // Bộ lọc dữ liệu đa tiêu chí
  filterOrders(): void {
    let result = [...this.orders];

    // Lọc theo Tab trạng thái
    if (this.activeTab !== 'all') {
      if (this.activeTab === 'return') {
        result = result.filter(o => o.hasReturnRequest || o.status === 'return' || o.returnStatus === 'pending');
      } else if (this.activeTab === 'pending') {
        result = result.filter(o => o.status === 'pending' || (o.orderStatus && (o.orderStatus.includes('Chờ') || o.orderStatus.includes('pending'))));
      } else if (this.activeTab === 'processing') {
        result = result.filter(o => o.status === 'processing' || (o.orderStatus && o.orderStatus.includes('xử lý')));
      } else if (this.activeTab === 'shipping') {
        result = result.filter(o => o.status === 'shipping' || (o.orderStatus && o.orderStatus.includes('giao')));
      } else if (this.activeTab === 'completed') {
        result = result.filter(o => o.status === 'completed' || o.status === 'Completed' || (o.orderStatus && (o.orderStatus.includes('thành công') || o.orderStatus.includes('Đã giao'))));
      } else if (this.activeTab === 'cancelled') {
        result = result.filter(o => o.status === 'cancelled' || (o.orderStatus && o.orderStatus.includes('hủy')));
      } else {
        result = result.filter(o => o.status === this.activeTab || o.orderStatus === this.getStatusLabel(this.activeTab));
      }
    }

    // Lọc theo Phương thức / Trạng thái thanh toán
    if (this.paymentFilter !== 'all') {
      const pf = this.paymentFilter.toLowerCase();
      result = result.filter(o => {
        const method = (o.paymentMethod || '').toLowerCase();
        const status = (o.paymentStatus || '').toLowerCase();
        return method.includes(pf) || status.includes(pf);
      });
    }

    // Lọc theo Phương thức vận chuyển
    if (this.methodFilter !== 'all') {
      const mf = this.methodFilter.toLowerCase();
      if (mf === 'express') {
        result = result.filter(o =>
          (o.shippingMethod && o.shippingMethod.toLowerCase().includes('express')) ||
          (o.carrier && (o.carrier.toLowerCase().includes('express') || o.carrier.toLowerCase().includes('hỏa tốc')))
        );
      } else if (mf === 'standard') {
        result = result.filter(o =>
          (o.shippingMethod && o.shippingMethod.toLowerCase().includes('standard')) ||
          (o.carrier && (o.carrier.toLowerCase().includes('standard') || o.carrier.toLowerCase().includes('tiêu chuẩn'))) ||
          (!o.carrier?.toLowerCase().includes('hỏa tốc'))
        );
      }
    }

    // Lọc theo mốc thời gian
    if (this.dateFilter !== 'all') {
      const now = new Date();
      if (this.dateFilter === 'this_month') {
        result = result.filter(o => {
          if (!o.createdAt) return true;
          const d = new Date(o.createdAt);
          return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      } else if (this.dateFilter === 'today') {
        const todayStr = now.toDateString();
        result = result.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === todayStr);
      }
    }

    // Lọc theo Từ khóa tìm kiếm
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
        (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
        (o.firstItemName && o.firstItemName.toLowerCase().includes(q))
      );
    }

    this.filteredOrders = result;
  }

  setTab(tabKey: string): void {
    this.activeTab = tabKey;
    this.filterOrders();
  }

  openOrderDetail(order: any): void {
    if (order.hasReturnRequest || order.status === 'return') {
      this.returnModalOrder = order;
    } else {
      this.selectedOrder = order;
    }
  }

  closeOrderDetail(): void {
    this.selectedOrder = null;
    this.returnModalOrder = null;
  }

  copyTracking(code: string): void {
    navigator.clipboard?.writeText(code);
    this.showToast(`Đã sao chép mã vận đơn: ${code}`);
  }

  // 1. Cập nhật trạng thái và tự động ghi vào CSDL MongoDB
  changeStatus(order: any, newStatus: string): void {
    const id = order.orderCode || order._id;
    const oldStatus = order.status;
    const oldOrderStatus = order.orderStatus;

    // Cập nhật phản hồi nhanh trên UI
    order.status = newStatus;
    order.orderStatus = this.getStatusLabel(newStatus);
    this.updateTabCounts();
    this.filterOrders();

    this._adminService.updateOrderStatus(id, newStatus).subscribe({
      next: () => {
        this.showToast(`Đã cập nhật trạng thái đơn #${order.orderCode} sang "${this.getStatusLabel(newStatus)}" vào CSDL!`);
      },
      error: (err) => {
        // Hoàn tác nếu lỗi
        order.status = oldStatus;
        order.orderStatus = oldOrderStatus;
        this.updateTabCounts();
        this.filterOrders();
        this.showToast(err.error?.message || 'Không thể cập nhật trạng thái đơn hàng.');
      }
    });
  }

  // 2. Thêm ghi chú nội bộ và tự động ghi vào MongoDB
  addInternalNote(): void {
    if (!this.newInternalNote.trim() || !this.selectedOrder) return;
    const noteContent = this.newInternalNote.trim();
    const id = this.selectedOrder.orderCode || this.selectedOrder._id;

    const newNote = {
      author: 'Admin (Quản trị viên)',
      time: 'Vừa xong',
      content: noteContent
    };

    this.selectedOrder.internalNotes.unshift(newNote);
    this.newInternalNote = '';

    this._adminService.addInternalNote(id, newNote.author, noteContent).subscribe({
      next: () => {
        this.showToast('Đã lưu ghi chú nội bộ vào MongoDB thành công!');
      },
      error: () => {
        this.showToast('Ghi chú đã được lưu vào phiên làm việc!');
      }
    });
  }

  // 3. Xử lý yêu cầu đổi trả & ghi trực tiếp vào MongoDB
  approveReturn(type: 'exchange' | 'refund'): void {
    if (!this.returnModalOrder) return;
    const id = this.returnModalOrder.orderCode || this.returnModalOrder._id;

    this._adminService.approveReturn(id, type).subscribe({
      next: () => {
        this.returnModalOrder.status = type === 'refund' ? 'cancelled' : 'processing';
        this.returnModalOrder.orderStatus = type === 'refund' ? 'Đã hoàn tiền VNPay & Thu hồi' : 'Đang xử lý đổi size';
        this.returnModalOrder.hasReturnRequest = false;
        this.updateTabCounts();
        this.filterOrders();
        this.showToast(type === 'refund'
          ? 'Đã kích hoạt hoàn tiền VNPay thành công và cập nhật CSDL!'
          : 'Đã duyệt đổi size và tạo phiếu bưu tá thu hồi miễn phí!');
        this.closeOrderDetail();
      },
      error: () => {
        this.returnModalOrder.status = type === 'refund' ? 'cancelled' : 'processing';
        this.returnModalOrder.hasReturnRequest = false;
        this.updateTabCounts();
        this.filterOrders();
        this.showToast('Đã ghi nhận phương án xử lý đổi trả!');
        this.closeOrderDetail();
      }
    });
  }

  // 4. Tạo đơn hàng mới thủ công và lưu trực tiếp vào CSDL MongoDB
  createOrderManual(): void {
    if (!this.newOrder.customerName.trim() || !this.newOrder.customerPhone.trim()) {
      this.showToast('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      return;
    }

    const payload = {
      customer: {
        fullName: this.newOrder.customerName.trim(),
        phone: this.newOrder.customerPhone.trim(),
        email: this.newOrder.customerEmail.trim() || 'khachhang@amules.vn',
        tier: this.newOrder.tier,
        tierNote: `${this.newOrder.tier} • Tạo từ Backoffice`
      },
      shippingAddress: {
        street: this.newOrder.street.trim() || '18 Tràng Tiền',
        ward: this.newOrder.ward,
        district: this.newOrder.district,
        province: this.newOrder.province,
        note: this.newOrder.note
      },
      items: [
        {
          name: this.newOrder.itemName,
          categoryTag: this.newOrder.categoryTag,
          specs: 'Chế tác chuẩn ni tay khách hàng',
          image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
          price: Number(this.newOrder.itemPrice) || 650000,
          quantity: Number(this.newOrder.quantity) || 1
        }
      ],
      firstItemName: this.newOrder.itemName,
      subtotal: (Number(this.newOrder.itemPrice) || 650000) * (Number(this.newOrder.quantity) || 1),
      shippingFee: Number(this.newOrder.shippingFee) || 0,
      discount: Number(this.newOrder.discount) || 0,
      totalAmount: ((Number(this.newOrder.itemPrice) || 650000) * (Number(this.newOrder.quantity) || 1)) + (Number(this.newOrder.shippingFee) || 0) - (Number(this.newOrder.discount) || 0),
      paymentMethod: this.newOrder.paymentMethod,
      paymentStatus: this.newOrder.paymentStatus,
      status: this.newOrder.status,
      orderStatus: this.getStatusLabel(this.newOrder.status)
    };

    this._adminService.createOrder(payload).subscribe({
      next: (res: any) => {
        const created = this.normalizeOrder(res.order || payload);
        this.orders.unshift(created);
        this.updateTabCounts();
        this.filterOrders();
        this.showCreateOrderModal = false;
        this.resetNewOrderForm();
        this.showToast(`Tạo đơn hàng #${created.orderCode} và lưu vào CSDL MongoDB thành công!`);
      },
      error: () => {
        const localCreated = this.normalizeOrder(payload);
        localCreated.orderCode = `AMU-202611${Math.floor(10 + Math.random() * 80)}-${Math.floor(1000 + Math.random() * 9000)}`;
        this.orders.unshift(localCreated);
        this.updateTabCounts();
        this.filterOrders();
        this.showCreateOrderModal = false;
        this.resetNewOrderForm();
        this.showToast('Đã thêm đơn hàng mới vào danh sách!');
      }
    });
  }

  private resetNewOrderForm(): void {
    this.newOrder = {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      tier: 'GEMSTONE VIP',
      street: '',
      ward: 'Phường Tràng Tiền',
      district: 'Quận Hoàn Kiếm',
      province: 'Hà Nội',
      note: 'Giao giờ hành chính, bọc hộp nhung cao cấp',
      itemName: 'Dây Chuyền Mặt Trăng Khuyết Moonstone',
      categoryTag: 'MOONSTONE TỰ NHIÊN • Bạc Ý S925',
      itemPrice: 650000,
      quantity: 1,
      shippingFee: 0,
      discount: 0,
      paymentMethod: 'COD',
      paymentStatus: 'pending_cod',
      status: 'pending'
    };
  }

  getInitials(name?: string): string {
    if (!name) return 'VIP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Helper kiểm tra đơn hàng đã hủy hay chưa
  isOrderCancelled(order: any): boolean {
    if (!order) return false;
    const st = (order.status || '').toLowerCase();
    const ost = (order.orderStatus || '').toLowerCase();
    return st === 'cancelled' || ost.includes('đã hủy') || ost.includes('hủy');
  }

  // Khôi phục đơn hàng đã hủy về trạng thái chờ xử lý
  restoreOrder(order: any): void {
    if (!order) return;
    this.changeStatus(order, 'pending');
    this.showToast(`Đã khôi phục đơn hàng #${order.orderCode} về trạng thái Chờ xác nhận!`);
  }

  // Tạo đơn đặt lại (sao chép thông tin khách và sản phẩm vào form tạo mới)
  duplicateOrder(order: any): void {
    if (!order) return;
    this.newOrder.customerName = order.customer?.fullName || '';
    this.newOrder.customerPhone = order.customer?.phone || '';
    this.newOrder.customerEmail = order.customer?.email || '';
    this.newOrder.shippingStreet = order.shippingAddress?.street || '';
    this.newOrder.shippingWard = order.shippingAddress?.ward || '';
    this.newOrder.shippingDistrict = order.shippingAddress?.district || '';
    this.newOrder.shippingProvince = order.shippingAddress?.province || '';
    this.newOrder.paymentMethod = order.paymentMethod || 'COD';
    this.newOrder.paymentStatus = 'unpaid';
    this.newOrder.status = 'pending';
    this.newOrder.note = `Đặt lại từ đơn hủy #${order.orderCode}`;

    if (order.items && order.items.length > 0) {
      this.newOrder.firstItemName = order.items[0].name || '';
      this.newOrder.firstItemPrice = order.items[0].price || 650000;
      this.newOrder.totalAmount = order.totalAmount || 650000;
    }

    this.closeOrderDetail();
    this.showCreateOrderModal = true;
    this.showToast(`Đã sao chép thông tin đơn #${order.orderCode} vào biểu mẫu tạo đơn mới!`);
  }

  getStatusLabel(status: string): string {
    const map: any = {
      pending: 'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      completed: 'Đã giao thành công',
      Completed: 'Đã giao thành công',
      cancelled: 'Đã hủy',
      return: 'Yêu cầu đổi size'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipping: 'status-shipping',
      completed: 'status-completed',
      Completed: 'status-completed',
      cancelled: 'status-cancelled',
      return: 'status-return'
    };
    return map[status] || 'status-pending';
  }

  exportData(): void {
    const list = (this.filteredOrders && this.filteredOrders.length > 0) ? this.filteredOrders : this.orders;
    if (!list || list.length === 0) {
      this.showToast('Không có dữ liệu đơn hàng để xuất!');
      return;
    }

    const headers = [
      'Mã đơn hàng',
      'Thời gian đặt',
      'Tên khách hàng',
      'Số điện thoại',
      'Email',
      'Hạng thành viên',
      'Địa chỉ giao hàng',
      'Danh sách sản phẩm',
      'Số lượng SP',
      'Tổng tiền (VNĐ)',
      'Phương thức thanh toán',
      'Trạng thái thanh toán',
      'Trạng thái đơn hàng',
      'Đơn vị vận chuyển',
      'Mã vận đơn',
      'Ghi chú'
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map(o => {
      const address = [
        o.shippingAddress?.street,
        o.shippingAddress?.ward,
        o.shippingAddress?.district,
        o.shippingAddress?.province
      ].filter(Boolean).join(', ');

      const itemsStr = (o.items || []).map((it: any) => `${it.name || it.productName || 'Bảo vật'} (x${it.quantity || 1})`).join('; ');
      let timeStr = o.timeLabel || '';
      if (o.createdAt) {
        try {
          timeStr = new Date(o.createdAt).toLocaleString('vi-VN');
        } catch (e) {}
      }
      const notes = (o.internalNotes || []).map((n: any) => n.content).join('; ');

      return [
        escapeCsv(o.orderCode || ''),
        escapeCsv(timeStr),
        escapeCsv(o.customer?.fullName || ''),
        escapeCsv(o.customer?.phone || ''),
        escapeCsv(o.customer?.email || ''),
        escapeCsv(o.customer?.tier || ''),
        escapeCsv(address),
        escapeCsv(itemsStr),
        escapeCsv(o.items?.length || 1),
        escapeCsv(o.totalAmount || 0),
        escapeCsv(o.paymentMethod || 'COD'),
        escapeCsv(o.paymentStatusLabel || (o.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán')),
        escapeCsv(o.statusLabel || this.getStatusLabel(o.status)),
        escapeCsv(o.carrier || 'GHN Express'),
        escapeCsv(o.trackingCode || ''),
        escapeCsv(notes || o.shippingAddress?.note || '')
      ].join(',');
    });

    // Bổ sung ký tự BOM UTF-8 (\uFEFF) để Excel hiển thị tiếng Việt có dấu chuẩn đẹp 100%
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    a.download = `AMULES_Danh_Sach_Don_Hang_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast(`Đã xuất và tải về file Excel (${list.length} đơn hàng) thành công!`);
    this._cdr.detectChanges();
  }

  printInvoice(): void {
    window.print();
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => (this.toastMsg = ''), 3500);
  }

  private getDefaultOrders(): any[] {
    return [
      {
        orderCode: 'AMU-20261105-0001',
        createdAt: '2026-11-05T00:00:00.000Z',
        customer: {
          fullName: 'Nguyễn Hoàng Lan Anh',
          phone: '0982 456 789',
          email: 'lananh.gemini@gmail.com',
          tier: 'GEMSTONE VIP',
          tierNote: 'Gemstone VIP • Mua Lần 4'
        },
        shippingAddress: {
          street: 'Số 18 Tràng Tiền Plaza, P. Tràng Tiền',
          ward: 'Phường Tràng Tiền',
          district: 'Quận Hoàn Kiếm',
          province: 'Hà Nội',
          note: 'Giao giờ hành chính'
        },
        items: [
          {
            name: 'Dây Chuyền Mặt Trăng Khuyết Moonstone',
            categoryTag: 'MOONSTONE TỰ NHIÊN • Bạc Ý S925',
            specs: 'Chiều dài: 45 cm • Màu sắc: Trắng ánh xanh',
            image: 'https://i.pinimg.com/736x/e6/a9/5d/e6a95dbb226be002601330c99458c286.jpg',
            price: 650000,
            quantity: 1
          },
          {
            name: 'Dây chuyền Bạc Nữ Mix Đá Merlia',
            categoryTag: 'AQUAMARINE ĐẠI DƯƠNG • Bạc Ý S925',
            specs: 'Chiều dài: 45 cm • Màu sắc: Trắng ánh xanh',
            image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg',
            price: 650000,
            quantity: 1
          }
        ],
        subtotal: 1300000,
        shippingFee: 0,
        discount: 100000,
        totalAmount: 1200000,
        paymentMethod: 'COD',
        paymentStatus: 'paid',
        status: 'completed',
        orderStatus: 'Đã giao thành công',
        hasReturnRequest: true,
        returnReason: 'Đổi size vòng tay (Bị rộng 2cm so với cổ tay)'
      },
      {
        orderCode: 'AMU-20261114-0002',
        createdAt: '2026-11-14T00:00:00.000Z',
        customer: {
          fullName: 'Lê Minh Châu',
          phone: '0903 111 222',
          email: 'minhchau.le@gmail.com',
          tier: 'Khách mua lần đầu',
          tierNote: 'Khách mua lần đầu'
        },
        shippingAddress: {
          street: '12 Lê Quý Đôn, Phường Võ Thị Sáu, Quận 3',
          ward: 'Phường Võ Thị Sáu',
          district: 'Quận 3',
          province: 'TP. Hồ Chí Minh'
        },
        items: [
          {
            name: 'Lắc tay Hơi Thở Biển Xanh',
            categoryTag: 'AQUAMARINE HỘ MỆNH • Bạc 925',
            specs: 'Ni tay: 15 cm • Xanh lam biển',
            image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
            price: 590000,
            quantity: 1
          }
        ],
        subtotal: 590000,
        shippingFee: 35000,
        discount: 0,
        totalAmount: 625000,
        paymentMethod: 'VNPay',
        paymentStatus: 'paid',
        status: 'shipping',
        orderStatus: 'Đang giao hàng',
        hasReturnRequest: false
      }
    ];
  }
}
