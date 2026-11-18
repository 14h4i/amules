import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const checkoutGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  // Nếu giỏ hàng có sản phẩm -> cho phép vào trang checkout
  if (cartService.cartItems().length > 0) {
    return true;
  }

  // Nếu giỏ hàng đang trống -> Chuyển hướng ngay về /cart
  router.navigate(['/cart']);
  return false;
};
