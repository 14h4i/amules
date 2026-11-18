import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface AddressItem {
  id: string | number;
  recipient: string;
  phone: string;
  typeLabel: string;
  address: string;
  note: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-addresses',
  standalone: false,
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css'
})
export class AddressesComponent implements OnInit {
  showAddModal = false;
  addresses: AddressItem[] = [];

  newAddress = {
    recipient: '',
    phone: '',
    typeLabel: 'NHÀ RIÊNG',
    address: '',
    note: '',
    isDefault: false
  };

  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) {}

  ngOnInit(): void {
    const cur = this._auth.currentUser();
    if (cur) {
      if (cur.fullName) this.newAddress.recipient = cur.fullName;
      if (cur.phone) this.newAddress.phone = cur.phone;
    }
    this.loadAddresses();
  }

  loadAddresses(): void {
    const cur = this._auth.currentUser();
    const curName = cur?.fullName || 'Người nhận';
    const curPhone = cur?.phone || '';
    const isDemo = cur?.email === 'lananh.gemini@gmail.com';

    this._http.get<any[]>('/api/users/addresses', { withCredentials: true }).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.addresses = data.map((d, idx) => ({
            id: d.id || `addr_${idx}`,
            recipient: d.fullName || d.recipient || curName,
            phone: d.phone || curPhone,
            typeLabel: d.label || d.typeLabel || 'NHÀ RIÊNG',
            address: d.address || `${d.street || ''}, ${d.ward || ''}, ${d.district || ''}, ${d.city || d.province || ''}`,
            note: d.note || 'Giao hàng tận tay',
            isDefault: !!d.isDefault
          }));
        } else {
          this.addresses = isDemo ? this.getDefaultAddresses() : [];
        }
      },
      error: () => {
        this.addresses = isDemo ? this.getDefaultAddresses() : [];
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveNewAddress(): void {
    if (!this.newAddress.address.trim()) return;

    this._http.post<any>('/api/users/addresses', {
      label: this.newAddress.typeLabel,
      fullName: this.newAddress.recipient,
      phone: this.newAddress.phone,
      address: this.newAddress.address,
      note: this.newAddress.note,
      isDefault: this.newAddress.isDefault
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadAddresses();
        this.newAddress.address = '';
        this.newAddress.note = '';
      },
      error: () => {
        // Fallback local update
        this.addresses.push({
          id: Date.now(),
          ...this.newAddress
        });
        this.closeAddModal();
      }
    });
  }

  setDefault(item: AddressItem) {
    this.addresses.forEach(a => (a.isDefault = a.id === item.id));
    this._http.put(`/api/users/addresses/${item.id}/default`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  removeAddress(id: string | number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
    this._http.delete(`/api/users/addresses/${id}`, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private getDefaultAddresses(): AddressItem[] {
    return [
      {
        id: '1',
        recipient: 'Nguyễn Hoàng Lan Anh',
        phone: '0982 456 789',
        typeLabel: 'CƠ QUAN / VĂN PHÒNG',
        address: 'Tòa tháp Tràng Tiền Plaza, Số 18 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Thành phố Hà Nội',
        note: 'Địa chỉ cơ quan, nhận hàng trong giờ hành chính',
        isDefault: true
      },
      {
        id: '2',
        recipient: 'Nguyễn Hoàng Lan Anh',
        phone: '0982 456 789',
        typeLabel: 'NHÀ RIÊNG',
        address: 'Căn hộ 1204, Tòa Park 7, KĐT Times City, 458 Minh Khai, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Thành phố Hà Nội',
        note: 'Giao ngoài giờ hành chính hoặc cuối tuần',
        isDefault: false
      }
    ];
  }
}