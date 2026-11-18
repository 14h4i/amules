import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const checkoutGuard: CanActivateFn = () => {
  const cartService = inject(CartService);
  const router = inject(Router);

  // Nếu giỏ hàng có sản phẩm được tích chọn mua -> cho phép vào trang checkout
  if (cartService.selectedItems().length > 0) {
    return true;
  }

  // Nếu chưa tích chọn món nào hoặc giỏ hàng trống -> Chuyển hướng về /cart
  router.navigate(['/cart']);
  return false;
};
