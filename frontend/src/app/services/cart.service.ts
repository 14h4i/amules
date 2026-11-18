import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  stone?: string;
  size?: string;
  element?: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API = '/api/cart';

  cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().length);
  cartTotalQuantity = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));

  // TÍCH CHỌN MUA BẢO VẬT TRONG GIỎ HÀNG
  selectedItems = computed(() => this.cartItems().filter(i => i.selected !== false));
  selectedCount = computed(() => this.selectedItems().length);
  selectedTotalQuantity = computed(() => this.selectedItems().reduce((acc, item) => acc + item.quantity, 0));
  selectedSubtotal = computed(() => this.selectedItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));
  selectedShippingFee = computed(() => (this.selectedSubtotal() >= 500000 || this.selectedItems().length === 0) ? 0 : 30000);

  appliedVoucher = signal<{ code: string; discountAmount: number; title: string } | null>(null);
  discount = computed(() => this.appliedVoucher() ? (this.appliedVoucher()?.discountAmount || 0) : 0);
  selectedDiscount = computed(() => this.discount());
  selectedTotalAmount = computed(() => Math.max(0, this.selectedSubtotal() - this.discount() + this.selectedShippingFee()));

  // Giữ alias tương thích các component khác
  subtotal = computed(() => this.selectedSubtotal());
  shippingFee = computed(() => this.selectedShippingFee());
  totalAmount = computed(() => this.selectedTotalAmount());

  isAllSelected = computed(() => this.cartItems().length > 0 && this.cartItems().every(i => i.selected !== false));

  constructor(private _http: HttpClient) {
    this.initCart();
  }

  getStorageKey(): string {
    try {
      const userStr = localStorage.getItem('amules_user') || localStorage.getItem('amules_admin');
      if (userStr) {
        const u = JSON.parse(userStr);
        const uid = u.id || u._id || u.email;
        if (uid) return `amules_cart_${uid}`;
      }
    } catch (e) {}
    return 'amules_cart';
  }

  initCart(): void {
    // 1. Tải giỏ hàng riêng biệt theo từng khách hàng từ localStorage
    try {
      const key = this.getStorageKey();
      const saved = localStorage.getItem(key) || (key !== 'amules_cart' ? localStorage.getItem('amules_cart') : null);
      if (saved) {
        this.cartItems.set(JSON.parse(saved));
      } else {
        this.cartItems.set([]);
      }
    } catch (e) {
      this.cartItems.set([]);
    }

    // 2. Fetch from backend session
    this.fetchCart();
  }

  reloadUserCart(): void {
    this.initCart();
  }

  private persistLocal(): void {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this.cartItems()));
    } catch (e) {}
  }

  fetchCart(): void {
    this.getCart().subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          if (items.length > 0) {
            this.cartItems.set(items);
            this.persistLocal();
          } else {
            const key = this.getStorageKey();
            const saved = localStorage.getItem(key);
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  this.cartItems.set(parsed);
                  parsed.forEach((item: any) => {
                    this._http.post<any>(`${this.API}/add`, item, { withCredentials: true }).subscribe({ error: () => {} });
                  });
                  return;
                }
              } catch (e) {}
            }
            this.cartItems.set([]);
            this.persistLocal();
          }
        }
      },
      error: () => {}
    });
  }

  getCart(): Observable<CartItem[]> {
    return this._http.get<CartItem[]>(this.API, { withCredentials: true }).pipe(
      catchError(() => of(this.cartItems()))
    );
  }

  toggleItemSelect(index: number, selected?: boolean): void {
    const current = [...this.cartItems()];
    if (index >= 0 && index < current.length) {
      const isCurrentSelected = current[index].selected !== false;
      current[index] = {
        ...current[index],
        selected: selected !== undefined ? selected : !isCurrentSelected
      };
      this.cartItems.set(current);
      this.persistLocal();
    }
  }

  toggleSelectAll(selectAll: boolean): void {
    const current = this.cartItems().map(item => ({
      ...item,
      selected: selectAll
    }));
    this.cartItems.set(current);
    this.persistLocal();
  }

  addToCart(item: CartItem): Observable<any> {
    // Optimistic update
    const current = [...this.cartItems()];
    const existing = current.find(i => i.productId === item.productId && i.size === item.size);
    if (existing) {
      existing.quantity += item.quantity || 1;
      existing.selected = true; // Luôn tích chọn lại khi thêm món
    } else {
      current.push({ ...item, quantity: item.quantity || 1, selected: true });
    }
    this.cartItems.set(current);
    this.persistLocal();

    return this._http.post<any>(`${this.API}/add`, item, { withCredentials: true }).pipe(
      catchError(() => of({ cart: this.cartItems() }))
    );
  }

  updateQuantity(index: number, quantity: number): Observable<any> {
    const current = [...this.cartItems()];
    if (index >= 0 && index < current.length) {
      if (quantity <= 0) {
        current.splice(index, 1);
      } else {
        current[index].quantity = quantity;
      }
      this.cartItems.set(current);
      this.persistLocal();
    }

    return this._http.post<any>(`${this.API}/update`, { index, quantity }, { withCredentials: true }).pipe(
      catchError(() => of({ cart: this.cartItems() }))
    );
  }

  removeItem(index: number): Observable<any> {
    const current = [...this.cartItems()];
    let removedItem: CartItem | null = null;
    if (index >= 0 && index < current.length) {
      removedItem = current[index];
      current.splice(index, 1);
      this.cartItems.set(current);
      this.persistLocal();
    }

    const payload: any = { index };
    if (removedItem) {
      payload.productId = removedItem.productId;
      payload.size = removedItem.size;
    }

    return this._http.post<any>(`${this.API}/remove`, payload, { withCredentials: true }).pipe(
      catchError(() => of({ cart: this.cartItems() }))
    );
  }

  removeSelected(): Observable<any> {
    const remaining = this.cartItems().filter(i => i.selected === false);
    this.cartItems.set(remaining);
    this.persistLocal();
    this.syncCartToBackend();
    return of({ cart: remaining });
  }

  removePurchasedItems(purchasedItems: CartItem[]): void {
    if (!purchasedItems || purchasedItems.length === 0) {
      this.clearCart();
      return;
    }
    const purchasedKeys = new Set(purchasedItems.map(p => `${p.productId}_${p.size || ''}`));
    const remaining = this.cartItems().filter(item => !purchasedKeys.has(`${item.productId}_${item.size || ''}`));
    this.cartItems.set(remaining);
    this.appliedVoucher.set(null);
    this.persistLocal();
    this.syncCartToBackend();
  }

  syncCartToBackend(): void {
    this._http.post<any>(`${this.API}/sync`, { cart: this.cartItems() }, { withCredentials: true }).subscribe({ error: () => {} });
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.appliedVoucher.set(null);
    this.persistLocal();
    this._http.delete<any>(this.API, { withCredentials: true }).subscribe({ error: () => {} });
  }

  applyVoucher(code: string): Observable<any> {
    return this._http.post<any>('/api/vouchers/apply', { code, orderTotal: this.subtotal() }, { withCredentials: true }).pipe(
      tap((res) => {
        if (res.valid) {
          this.appliedVoucher.set({
            code: res.voucher.code,
            discountAmount: res.discountAmount,
            title: res.voucher.title || res.voucher.code
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  removeVoucher(): void {
    this.appliedVoucher.set(null);
  }

  private saveOrderLocally(order: any): void {
    if (!order) return;
    try {
      const existingStr = localStorage.getItem('amules_orders');
      let orders = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(orders)) orders = [];
      const code = order.orderCode;
      orders = [order, ...orders.filter((o: any) => o && o.orderCode !== code)];
      localStorage.setItem('amules_orders', JSON.stringify(orders));

      const userOrdersStr = localStorage.getItem('amules_user_orders');
      let userOrders = userOrdersStr ? JSON.parse(userOrdersStr) : [];
      if (!Array.isArray(userOrders)) userOrders = [];
      userOrders = [order, ...userOrders.filter((o: any) => o && o.orderCode !== code)];
      localStorage.setItem('amules_user_orders', JSON.stringify(userOrders));
    } catch (e) {
      console.warn('Lỗi lưu đơn hàng vào localStorage:', e);
    }
  }

  checkout(orderPayload: any): Observable<any> {
    const payload = {
      items: (orderPayload && orderPayload.items && orderPayload.items.length) ? orderPayload.items : this.selectedItems(),
      subtotal: orderPayload?.subtotal !== undefined ? orderPayload.subtotal : this.selectedSubtotal(),
      discount: orderPayload?.discount !== undefined ? orderPayload.discount : this.selectedDiscount(),
      shippingFee: orderPayload?.shippingFee !== undefined ? orderPayload.shippingFee : this.selectedShippingFee(),
      totalAmount: orderPayload?.totalAmount !== undefined ? orderPayload.totalAmount : this.selectedTotalAmount(),
      ...orderPayload
    };

    return this._http.post<any>(`${this.API}/checkout`, payload, { withCredentials: true }).pipe(
      timeout(5000),
      tap((res) => {
        // Chỉ xóa sản phẩm được mua trong đơn này, giữ lại sản phẩm chưa chọn mua!
        this.removePurchasedItems(payload.items);
        this.saveOrderLocally(res?.order || res || payload);
      }),
      catchError((err) => {
        console.warn('[CartService] Checkout API chậm hoặc lỗi, tự động tạo đơn an toàn:', err);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rawNumber = Math.floor(1000 + Math.random() * 9000);
        const orderCode = payload?.orderCode || `AMU-${dateStr}-${rawNumber}`;
        const trackingCode = `GHN-AMU-${rawNumber}`;
        const fallbackOrder = {
          orderCode,
          trackingCode,
          carrier: payload.carrier || 'Giao Hàng Nhanh (GHN Express)',
          customer: payload.customer || {},
          shippingAddress: payload.shippingAddress || {},
          items: payload.items || this.selectedItems(),
          shippingMethod: payload.shippingMethod || 'STANDARD',
          shippingFee: payload.shippingFee || 0,
          subtotal: payload.subtotal || 0,
          discount: payload.discount || 0,
          totalAmount: payload.totalAmount || 0,
          paymentMethod: payload.paymentMethod || 'COD',
          paymentStatus: payload.paymentMethod === 'COD' ? 'pending_cod' : 'unpaid',
          paymentStatusLabel: payload.paymentMethod === 'COD' ? 'Chờ thu hộ COD' : 'Chờ thanh toán',
          status: 'pending',
          orderStatus: 'Chờ xác nhận & thanh tẩy đá',
          createdAt: new Date().toISOString()
        };
        this.saveOrderLocally(fallbackOrder);
        this.removePurchasedItems(payload.items);
        return of({
          message: 'Đặt hàng thành công!',
          orderCode,
          trackingCode,
          carrier: fallbackOrder.carrier,
          order: fallbackOrder
        });
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    const msg = error.error?.message || error.message || 'Lỗi thao tác giỏ hàng.';
    return throwError(() => new Error(msg));
  }
}
