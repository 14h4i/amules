import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-success',
  standalone: false,
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
  orderCode = '';
  deliveryDate = '';
  paymentGateway = 'COD';
  isPaid = false;
  trackingCode = '';
  carrier = 'Giao Hàng Nhanh (GHN Express)';
  totalAmount = 0;
  copiedText = '';
  isConfirming = false;

  qrUrl = '';
  bankName = 'MB Bank (Ngân hàng Quân Đội)';
  accountNo = '0988 888 888';
  accountName = 'CONG TY TNHH AMULES VIETNAM';

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.orderCode = params['code'] || `AMU-${Date.now().toString().slice(-6)}`;
      this.trackingCode = `GHN-${this.orderCode.replace(/^AMU-?/, '')}`;
      this.fetchOrderDetails();
      this._cdr.detectChanges();
    });

    this._route.queryParams.subscribe(q => {
      if (q['gateway']) {
        const gw = (q['gateway'] || '').toUpperCase();
        if (gw.includes('VN') || gw.includes('VNPAY')) this.paymentGateway = 'VNPAY';
        else if (gw.includes('MOMO')) this.paymentGateway = 'MOMO';
        else if (gw.includes('BANK') || gw.includes('CK')) this.paymentGateway = 'BANKING';
        else if (gw.includes('COD')) this.paymentGateway = 'COD';
        else this.paymentGateway = q['gateway'];
      }
      if (q['amount']) {
        this.totalAmount = Number(q['amount']) || 0;
      }
      if (q['payment'] === 'success') {
        this.isPaid = true;
      }
      this.updateQrCode();
      this._cdr.detectChanges();
    });

    const now = new Date();
    now.setDate(now.getDate() + 3);
    this.deliveryDate = now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  fetchOrderDetails(): void {
    if (!this.orderCode) return;
    this._http.get<any>(`/api/orders/${this.orderCode}`).subscribe({
      next: (order) => {
        if (order) {
          if (order.paymentMethod) {
            const pm = (order.paymentMethod || '').toUpperCase();
            if (pm.includes('VN') || pm.includes('VNPAY')) this.paymentGateway = 'VNPAY';
            else if (pm.includes('MOMO')) this.paymentGateway = 'MOMO';
            else if (pm.includes('BANK') || pm.includes('CK')) this.paymentGateway = 'BANKING';
            else if (pm.includes('COD')) this.paymentGateway = 'COD';
            else this.paymentGateway = order.paymentMethod;
          }
          if (order.totalAmount) this.totalAmount = order.totalAmount;
          if (order.trackingCode) this.trackingCode = order.trackingCode;
          if (order.carrier) this.carrier = order.carrier;
          if (order.paymentStatus === 'paid' || order.paymentStatusLabel === 'Đã thanh toán') {
            this.isPaid = true;
          }
          this.updateQrCode();
          this._cdr.detectChanges();
        }
      },
      error: () => {
        this._cdr.detectChanges();
      }
    });
  }

  get transferMemo(): string {
    const code = this.orderCode || 'AMULES';
    // Đảm bảo không bị lặp "AMU AMU-..."
    return code.startsWith('AMU-') ? code : `AMU-${code}`;
  }

  get paymentGatewayLabel(): string {
    switch (this.paymentGateway) {
      case 'VNPAY': return 'VNPAY-QR';
      case 'MOMO': return 'Ví MoMo';
      case 'BANKING': return 'Chuyển khoản VietQR';
      case 'COD': return 'COD (Tiền mặt khi nhận)';
      default: return this.paymentGateway || 'COD (Tiền mặt khi nhận)';
    }
  }

  updateQrCode(): void {
    const amt = this.totalAmount || 0;
    const memo = encodeURIComponent(this.transferMemo);
    if (this.paymentGateway === 'VNPAY') {
      this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fpay.vnpay.vn%2Fqr%3Forder%3D${memo}%26amount%3D${amt}`;
    } else if (this.paymentGateway === 'MOMO') {
      this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2|99|0988888888|AMULES%20VIETNAM||0|0|${amt}|${memo}|transfer_mycode`;
    } else if (this.paymentGateway === 'BANKING') {
      this.qrUrl = `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${amt}&addInfo=${memo}&accountName=CONG%20TY%20TNHH%20AMULES%20VIETNAM`;
    }
  }

  copyInfo(text: string, label: string): void {
    navigator.clipboard?.writeText(text);
    this.copiedText = label;
    this._cdr.detectChanges();
    setTimeout(() => {
      if (this.copiedText === label) {
        this.copiedText = '';
        this._cdr.detectChanges();
      }
    }, 2000);
  }

  confirmPayment(): void {
    this.isConfirming = true;
    this._cdr.detectChanges();
    this._http.post<any>('/api/payments/verify', {
      orderCode: this.orderCode,
      paymentMethod: this.paymentGateway || 'BANKING',
      transactionId: `TXN_${Date.now()}`
    }).subscribe({
      next: () => {
        this.isPaid = true;
        this.isConfirming = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.isPaid = true;
        this.isConfirming = false;
        this._cdr.detectChanges();
      }
    });
  }
}
