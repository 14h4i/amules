import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  showSyncBanner = true;
  savedNotice = false;
  saving = false;
  errorMsg = '';

  // Tất cả trường thông tin mặc định để TRỐNG đối với tài khoản mới chưa cập nhật
  profile = {
    fullName: '',
    nickname: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    element: '',
    zodiac: '',
    wristSize: '',
    avatar: ''
  };

  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) {}

  populateUser(u: any): void {
    if (!u) return;
    this.profile.fullName = u.fullName || this.profile.fullName || '';
    if (u.fullName && !this.profile.nickname) {
      const parts = u.fullName.trim().split(/\s+/);
      this.profile.nickname = u.nickname || (parts.length > 0 ? parts[parts.length - 1] : u.fullName);
    } else if (u.nickname) {
      this.profile.nickname = u.nickname;
    }
    this.profile.email = u.email || this.profile.email || '';
    this.profile.phone = u.phone || '';
    this.profile.dob = u.dob || '';
    this.profile.gender = u.gender || '';
    this.profile.element = u.element || '';
    this.profile.zodiac = u.zodiac || '';
    this.profile.wristSize = u.wristSize || '';
    this.profile.avatar = u.avatar || '';
  }

  ngOnInit(): void {
    // 1. Đồng bộ tức thì từ thông tin phiên đăng nhập AuthService / localStorage
    const cur = this._auth.currentUser();
    if (cur) {
      this.populateUser(cur);
    }

    // 2. Đồng bộ thêm dữ liệu người dùng từ cơ sở dữ liệu MongoDB Backend
    this._http.get<any>('/api/auth/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res && res.user) {
          this.populateUser(res.user);
        }
      },
      error: () => {
        const c = this._auth.currentUser();
        if (c) this.populateUser(c);
      }
    });
  }

  // Tự động tính toán Mệnh Ngũ Hành & Cung Hoàng Đạo khi người dùng nhập ngày sinh
  onDobChange(): void {
    const dob = (this.profile.dob || '').trim();
    if (!dob) {
      this.profile.element = '';
      this.profile.zodiac = '';
      return;
    }
    // Hỗ trợ cả định dạng dd/mm/yyyy và yyyy-mm-dd
    let day = 0, month = 0, year = 0;
    if (dob.includes('/')) {
      const parts = dob.split('/').map(p => parseInt(p.trim(), 10));
      if (parts.length === 3) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    } else if (dob.includes('-')) {
      const parts = dob.split('-').map(p => parseInt(p.trim(), 10));
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
    }

    if (day && month && day > 0 && day <= 31 && month > 0 && month <= 12) {
      this.profile.zodiac = this.calcZodiac(day, month);
      if (year && year > 1900 && year < 2100) {
        this.profile.element = this.calcElement(year);
      }
    }
  }

  private calcZodiac(day: number, month: number): string {
    const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    const signs = [
      'Ma Kết (Capricorn) - 22/12 - 19/01',
      'Bảo Bình (Aquarius) - 20/01 - 18/02',
      'Song Ngư (Pisces) - 19/02 - 20/03',
      'Bạch Dương (Aries) - 21/03 - 19/04',
      'Kim Ngưu (Taurus) - 20/04 - 20/05',
      'Song Tử (Gemini) - 21/05 - 20/06',
      'Cự Giải (Cancer) - 21/06 - 22/07',
      'Sư Tử (Leo) - 23/07 - 22/08',
      'Xử Nữ (Virgo) - 23/08 - 22/09',
      'Thiên Bình (Libra) - 23/09 - 22/10',
      'Bọ Cạp (Scorpio) - 23/10 - 21/11',
      'Nhân Mã (Sagittarius) - 22/11 - 21/12',
      'Ma Kết (Capricorn) - 22/12 - 19/01'
    ];
    return day < dates[month - 1] ? signs[month - 1] : signs[month];
  }

  private calcElement(year: number): string {
    const can = year % 10;
    const chi = year % 12;
    const canVal: any = { 4: 1, 5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 0: 4, 1: 4, 2: 5, 3: 5 };
    const chiVal: any = { 4: 0, 5: 0, 6: 1, 7: 1, 8: 2, 9: 2, 10: 0, 11: 0, 0: 1, 1: 1, 2: 2, 3: 2 };
    let sum = (canVal[can] || 1) + (chiVal[chi] || 0);
    if (sum > 5) sum -= 5;
    const elements: any = {
      1: 'Mệnh Kim (Tương sinh: Thổ & Thủy)',
      2: 'Mệnh Thủy (Tương sinh: Kim & Mộc)',
      3: 'Mệnh Hỏa (Tương sinh: Mộc & Thổ)',
      4: 'Mệnh Thổ (Tương sinh: Hỏa & Kim)',
      5: 'Mệnh Mộc (Tương sinh: Thủy & Hỏa)'
    };
    return elements[sum] || 'Mệnh Thủy (Tương sinh: Kim & Thủy)';
  }

  getInitials(name?: string): string {
    if (!name) return 'AM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  saveProfile() {
    this.saving = true;
    this.errorMsg = '';
    this._http.put('/api/auth/profile', this.profile, { withCredentials: true }).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.savedNotice = true;
        const cur = this._auth.currentUser() || {};
        const updated = { ...cur, ...this.profile };
        this._auth.currentUser.set(updated);
        localStorage.setItem('amules_user', JSON.stringify(updated));
        setTimeout(() => (this.savedNotice = false), 3500);
      },
      error: () => {
        const cur = this._auth.currentUser() || {};
        const updated = { ...cur, ...this.profile };
        this._auth.currentUser.set(updated);
        localStorage.setItem('amules_user', JSON.stringify(updated));
        this.saving = false;
        this.savedNotice = true;
        setTimeout(() => (this.savedNotice = false), 3500);
      }
    });
  }
}
