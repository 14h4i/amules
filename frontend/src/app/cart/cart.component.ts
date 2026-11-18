import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  voucherCode = '';
  voucherMsg = '';
  voucherError = '';
  applyingVoucher = false;

  constructor(
    public _cartService: CartService,
    public _authService: AuthService,
    private _router: Router
  ) {}

  get cartItems(): CartItem[] {
    return this._cartService.cartItems();
  }

  get subtotal(): number {
    return this._cartService.subtotal();
  }

  get shippingFee(): number {
    return this._cartService.shippingFee();
  }

  get discount(): number {
    return this._cartService.discount();
  }

  get totalAmount(): number {
    return this._cartService.totalAmount();
  }

  updateQuantity(index: number, quantity: number): void {
    this._cartService.updateQuantity(index, quantity);
  }

  removeItem(index: number): void {
    this._cartService.removeItem(index);
  }

  clearCart(): void {
    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      this._cartService.clearCart();
    }
  }

  onApplyVoucher(): void {
    if (!this.voucherCode.trim()) return;
    this.applyingVoucher = true;
    this.voucherMsg = '';
    this.voucherError = '';

    this._cartService.applyVoucher(this.voucherCode).subscribe({
      next: (res) => {
        this.applyingVoucher = false;
        this.voucherMsg = res.message || 'Áp dụng mã giảm giá thành công!';
      },
      error: (err) => {
        this.applyingVoucher = false;
        this.voucherError = err.message || 'Mã ưu đãi không hợp lệ.';
      }
    });
  }

  removeVoucher(): void {
    this._cartService.removeVoucher();
    this.voucherCode = '';
    this.voucherMsg = '';
    this.voucherError = '';
  }

  goToCheckout(): void {
    this._router.navigate(['/checkout']);
  }
}
