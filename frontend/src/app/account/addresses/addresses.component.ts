import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private _auth: AuthService,
    private _cdr: ChangeDetectorRef
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

    this._http.get<any[]>('/api/users/addresses', { withCredentials: true }).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.addresses = data.map((d, idx) => ({
            id: d.id || d._id || `addr_${idx}`,
            recipient: d.fullName || d.recipient || curName,
            phone: d.phone || curPhone,
            typeLabel: d.label || d.typeLabel || 'NHÀ RIÊNG',
            address: d.address || `${d.street || ''}, ${d.ward || ''}, ${d.district || ''}, ${d.city || d.province || ''}`,
            note: d.note || 'Giao hàng tận tay',
            isDefault: !!d.isDefault
          }));
        } else {
          this.addresses = [];
        }
        this._cdr.detectChanges();
      },
      error: () => {
        this.addresses = [];
        this._cdr.detectChanges();
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
        this.closeAddModal();
        this.loadAddresses();
      }
    });
  }

  setDefault(item: AddressItem) {
    this.addresses.forEach(a => (a.isDefault = a.id === item.id));
    this._cdr.detectChanges();
    this._http.put(`/api/users/addresses/${item.id}/default`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  removeAddress(id: string | number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
    this._cdr.detectChanges();
    this._http.delete(`/api/users/addresses/${id}`, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
