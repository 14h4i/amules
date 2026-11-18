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
      if (q['payment'] === 'success' || this.paymentGateway) {
        this.isPaid = true;
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
}
