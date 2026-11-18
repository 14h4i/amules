import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: false,
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
  orderCode = '';
  deliveryDate = '';
  paymentGateway = '';
  isPaid = false;
  trackingCode = '';
  carrier = 'Giao Hàng Nhanh (GHN Express)';
  totalAmount = 0;
  copiedText = '';

  qrUrl = '';
  bankName = 'MB Bank (Ngân hàng Quân Đội)';
  accountNo = '0988 888 888';
  accountName = 'CONG TY TNHH AMULES VIETNAM';

  constructor(private _route: ActivatedRoute) {}

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.orderCode = params['code'] || `AMU-${Date.now().toString().slice(-6)}`;
      this.trackingCode = `GHN-${this.orderCode.replace(/^AMU-?/, '')}`;
    });

    this._route.queryParams.subscribe(q => {
      if (q['gateway']) {
        this.paymentGateway = q['gateway'];
      }
      if (q['amount']) {
        this.totalAmount = Number(q['amount']) || 0;
      }
      if (q['payment'] === 'success') {
        this.isPaid = true;
      }

      const amt = this.totalAmount || 590000;
      if (this.paymentGateway === 'VNPAY') {
        this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AMULES_VNPAY_${this.orderCode}`;
      } else if (this.paymentGateway === 'MOMO') {
        this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AMULES_MOMO_${this.orderCode}`;
      } else if (this.paymentGateway === 'BANKING') {
        this.qrUrl = `https://img.vietqr.io/image/MB-0988888888-compact2.png?amount=${amt}&addInfo=AMU%20${this.orderCode}&accountName=CONG%20TY%20TNHH%20AMULES%20VIETNAM`;
      }
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

  copyInfo(text: string, label: string): void {
    navigator.clipboard?.writeText(text);
    this.copiedText = label;
    setTimeout(() => {
      if (this.copiedText === label) this.copiedText = '';
    }, 2000);
  }

  confirmPayment(): void {
    this.isPaid = true;
  }
}
