import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  submitting = false;
  errorMsg = '';
  selectedPayment: 'COD' | 'VNPAY' | 'MOMO' | 'BANKING' = 'COD';
  selectedShipping: 'STANDARD' | 'EXPRESS' = 'STANDARD';

  // 3rd-Party Payment Modal State (BPMN Trang 10 & 11)
  showPaymentModal = false;
  activeGateway: 'VNPAY' | 'MOMO' | 'BANKING' | null = null;
  gatewayData: any = null;
  countdownSeconds = 900; // 15 phút
  countdownDisplay = '15:00';
  countdownInterval: any = null;
  verifyingPayment = false;
  pendingOrderCode = '';
  copiedText = '';
  lastOrderAmount = 0;
  lastCustomerName = '';

  checkoutForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^0\d{9}$/)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    province: new FormControl('Hồ Chí Minh', [Validators.required]),
    district: new FormControl('Quận 1', [Validators.required]),
    ward: new FormControl('Phường Bến Nghé', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    note: new FormControl('')
  });

  constructor(
    public _cartService: CartService,
    private _authService: AuthService,
    private _http: HttpClient,
    private _router: Router
  ) {}

  ngOnInit(): void {
    if (this._cartService.selectedItems().length === 0) {
      this._router.navigate(['/cart']);
      return;
    }

    // Auto-fill from current user profile if logged in
    const user = this._authService.currentUser();
    if (user) {
      this.checkoutForm.patchValue({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      if (user.addresses && user.addresses.length > 0) {
        const def = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        this.checkoutForm.patchValue({
          province: def.province || 'Hồ Chí Minh',
          district: def.district || 'Quận 1',
          ward: def.ward || 'Phường Bến Nghé',
          street: def.street || ''
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  get f() { return this.checkoutForm.controls; }

  get cartItems(): CartItem[] { return this._cartService.selectedItems(); }
  get subtotal(): number { return this._cartService.selectedSubtotal(); }
  get discount(): number { return this._cartService.selectedDiscount(); }
  get shippingFee(): number {
    if (this.cartItems.length === 0) return 0;
    const base = this._cartService.selectedShippingFee();
    return this.selectedShipping === 'EXPRESS' ? base + 25000 : base;
  }
  get totalAmount(): number {
    if (this.cartItems.length === 0) return 0;
    return Math.max(0, this.subtotal - this.discount + this.shippingFee);
  }

  startCountdown(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownSeconds = 900;
    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownDisplay = '00:00';
      } else {
        const mins = Math.floor(this.countdownSeconds / 60);
        const secs = this.countdownSeconds % 60;
        this.countdownDisplay = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 1000);
  }

  copyInfo(text: string, label: string): void {
    navigator.clipboard?.writeText(text);
    this.copiedText = label;
    setTimeout(() => {
      if (this.copiedText === label) this.copiedText = '';
    }, 2000);
  }

  onSubmitOrder(): void {
    if (this.cartItems.length === 0) {
      this.errorMsg = 'Giỏ hàng của bạn đang trống. Vui lòng chọn ít nhất một tác phẩm phong thủy trước khi thanh toán!';
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    const formVal = this.checkoutForm.value;

    // Lưu lại thông tin thanh toán TRƯỚC KHI giỏ hàng bị clearCart()
    const finalAmount = this.totalAmount;
    const finalShippingFee = this.shippingFee;
    const finalSubtotal = this.subtotal;
    const finalDiscount = this.discount;
    const finalItems = [...this.cartItems];
    this.lastOrderAmount = finalAmount;
    this.lastCustomerName = formVal.fullName;

    const orderPayload = {
      customer: {
        fullName: formVal.fullName,
        phone: formVal.phone,
        email: formVal.email
      },
      shippingAddress: {
        province: formVal.province,
        district: formVal.district,
        ward: formVal.ward,
        street: formVal.street,
        note: formVal.note
      },
      carrier: 'Giao Hàng Nhanh (GHN Express)',
      shippingMethod: this.selectedShipping,
      paymentMethod: this.selectedPayment,
      shippingFee: finalShippingFee,
      subtotal: finalSubtotal,
      discount: finalDiscount,
      totalAmount: finalAmount,
      items: finalItems
    };

    this._cartService.checkout(orderPayload).pipe(
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe({
      next: (res) => {
        this.submitting = false;
        const code = res.orderCode || (res.order && res.order.orderCode) || `AMU-${Date.now().toString().slice(-6)}`;
        this.pendingOrderCode = code;

        // Luôn chuyển tiếp mượt mà sang bước Đặt hàng thành công
        this._router.navigate(['/order-success', code], {
          queryParams: {
            gateway: this.selectedPayment !== 'COD' ? this.selectedPayment : undefined,
            amount: finalAmount
          }
        });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.message || 'Lỗi xử lý đặt hàng. Vui lòng kiểm tra lại.';
      }
    });
  }

  // Xác nhận thanh toán thành công từ Sandbox
  confirmSandboxPayment(): void {
    this.verifyingPayment = true;
    this._http.post<any>('/api/payments/verify', {
      orderCode: this.pendingOrderCode,
      paymentMethod: this.activeGateway,
      transactionId: `TXN_${Date.now()}`
    }).subscribe({
      next: () => {
        this.verifyingPayment = false;
        this.showPaymentModal = false;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this._router.navigate(['/order-success', this.pendingOrderCode], {
          queryParams: { payment: 'success', gateway: this.activeGateway }
        });
      },
      error: () => {
        // Fallback
        this.verifyingPayment = false;
        this.showPaymentModal = false;
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this._router.navigate(['/order-success', this.pendingOrderCode], {
          queryParams: { payment: 'success', gateway: this.activeGateway }
        });
      }
    });
  }

  payLater(): void {
    this.showPaymentModal = false;
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this._router.navigate(['/order-success', this.pendingOrderCode]);
  }
}
