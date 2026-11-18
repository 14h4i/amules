import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  orderCode = '#AMU-2025-8942';
  orderDate = '28/10/2025 lúc 14:30';
  channel = 'Website AMULES Trực Tuyến';
  orderStatus = 'Đang vận chuyển hỏa tốc';
  isCancelled = false;
  isReturned = false;

  recipientName = '';
  recipientPhone = '';
  recipientAddress = '';
  totalAmount = 0;
  subtotal = 0;
  trackingCode = '';

  // Cancel modal
  showCancelModal = false;
  cancelReason = 'Đổi ý không muốn mua nữa';
  customCancelReason = '';
  cancelling = false;

  // Return modal
  showReturnModal = false;
  returnReason = 'Kích thước không vừa (muốn đổi size)';
  returnNote = '';
  returning = false;

  toastMsg = '';

  steps = [
    { status: 'done', badge: 'HOÀN THÀNH', title: 'Đã đặt hàng', time: '28/10 • 14:30' },
    { status: 'done', badge: 'HOÀN THÀNH', title: 'Đã chuyển hàng', time: '28/10 • 16:00' },
    { status: 'active', badge: 'ĐANG XỬ LÝ', title: 'Đang giao hàng', time: 'Dự kiến trước 18:00 hôm nay' },
    { status: 'pending', badge: 'CHỜ NHẬN', title: 'Giao thành công', time: 'Xác nhận tận tay' }
  ];

  items = [
    {
      name: 'Vòng Tay Nguyệt Quang Moonstone Ánh Lam S925',
      element: 'Mệnh Thủy & Kim',
      spec: 'Size 15cm',
      qty: '01',
      price: 680000,
      image: 'images/lac_tay_bien.png'
    },
    {
      name: 'Dây Chuyền Trầm Thủy Aquamarine Biển Sâu',
      element: 'Mệnh Thủy',
      spec: '45cm Bạc Ý mạ vàng 18K',
      qty: '01',
      price: 620000,
      image: 'images/dch_mix_da.png'
    }
  ];

  gifts = [
    'Hộp nhung hoàng gia & Thiệp an lành viết tay',
    'Túi thơm thảo mộc thanh tẩy đá tự nhiên'
  ];

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id') || this._route.snapshot.paramMap.get('code');
    if (id) {
      this.orderCode = id.startsWith('#') ? id : `#${id}`;
      this._http.get<any>(`/api/orders/${id.replace('#', '')}`).subscribe({
        next: (order) => {
          if (order) {
            this.orderCode = `#${order.orderCode || id}`;
            this.orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            if (order.status === 'cancelled' || order.orderStatus === 'Đã hủy') {
              this.isCancelled = true;
              this.orderStatus = 'Đã hủy';
            }
            if (order.trackingCode) {
              this.trackingCode = order.trackingCode;
            }
            if (order.totalAmount) {
              this.totalAmount = order.totalAmount;
              this.subtotal = order.subtotal || order.totalAmount;
            }
            if (order.items && order.items.length > 0) {
              this.items = order.items.map((i: any) => ({
                name: i.name,
                element: i.element || 'Bảo vật phong thủy',
                spec: `Kích thước: ${i.size || '15 cm'}`,
                qty: (i.quantity || 1).toString().padStart(2, '0'),
                price: i.price,
                image: i.image || 'images/lac_tay_bien.png'
              }));
            }
            if (order.customer || order.shippingAddress) {
              this.recipientName = order.customer?.fullName || this.recipientName;
              this.recipientPhone = order.customer?.phone || order.shippingAddress?.phone || this.recipientPhone;
              const s = order.shippingAddress;
              if (s) {
                this.recipientAddress = s.address || `${s.street || ''}, ${s.ward || ''}, ${s.district || ''}, ${s.city || s.province || ''}`;
              }
            }
          }
        },
        error: () => {}
      });
    }
  }

  printInvoice() {
    window.print();
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.cancelling = true;
    const finalReason = this.cancelReason === 'other' ? this.customCancelReason : this.cancelReason;
    const cleanId = this.orderCode.replace('#', '');

    this._http.put<any>(`/api/orders/${cleanId}/cancel`, { reason: finalReason }).subscribe({
      next: () => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.isCancelled = true;
        this.orderStatus = 'Đã hủy';
        this.toastMsg = 'Đã hủy đơn hàng thành công!';
        setTimeout(() => (this.toastMsg = ''), 4000);
      },
      error: () => {
        this.cancelling = false;
        this.showCancelModal = false;
        this.isCancelled = true;
        this.orderStatus = 'Đã hủy';
        this.toastMsg = 'Đã tiếp nhận yêu cầu hủy đơn hàng.';
        setTimeout(() => (this.toastMsg = ''), 4000);
      }
    });
  }

  openReturnModal(): void {
    this.showReturnModal = true;
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  confirmReturn(): void {
    this.returning = true;
    const cleanId = this.orderCode.replace('#', '');

    this._http.post<any>(`/api/orders/${cleanId}/return`, {
      reason: this.returnReason,
      note: this.returnNote
    }).subscribe({
      next: () => {
        this.returning = false;
        this.showReturnModal = false;
        this.isReturned = true;
        this.toastMsg = 'Đã gửi yêu cầu đổi trả thành công. Chuyên viên AMULES sẽ liên hệ bạn sớm nhất!';
        setTimeout(() => (this.toastMsg = ''), 5000);
      },
      error: () => {
        this.returning = false;
        this.showReturnModal = false;
        this.isReturned = true;
        this.toastMsg = 'Đã ghi nhận yêu cầu đổi trả bảo vật của bạn.';
        setTimeout(() => (this.toastMsg = ''), 5000);
      }
    });
  }
}
