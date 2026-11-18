import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Cross-field validation: mật khẩu và nhập lại mật khẩu phải trùng nhau
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPass')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;
  showConfirm = false;
  submitting = false;
  errorMsg = '';

  public regForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^0\d{9}$/)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    ]),
    confirmPass: new FormControl('', [Validators.required]),
    agree: new FormControl(false, [Validators.requiredTrue]),
    newsletter: new FormControl(false)
  }, { validators: passwordMatchValidator });

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) { }

  // Lối tắt để template viết gọn: f['email']
  get f() { return this.regForm.controls; }

  // Độ mạnh mật khẩu: 0 -> 4
  get strength(): number {
    const v: string = this.f['password'].value ?? '';
    let s = 0;
    if (v.length >= 8) s++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }
  get strengthText(): string {
    return ['Chưa nhập mật khẩu', 'Mật khẩu yếu', 'Mật khẩu vừa', 'Mật khẩu khá', 'Mật khẩu mạnh'][this.strength];
  }
  get strengthBadge(): string {
    return ['', 'Yếu', 'Vừa', 'Mạnh', 'Rất mạnh'][this.strength];
  }
  // Dấu tick xanh ở ô xác nhận khi 2 mật khẩu khớp
  get passwordsMatch(): boolean {
    const c = this.f['confirmPass'].value;
    return !!c && c === this.f['password'].value;
  }

  onRegister() {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      return;
    }
    const v = this.regForm.value;
    this.submitting = true;
    this.errorMsg = '';
    this._auth.register({
      fullName: v.fullName, email: v.email, phone: v.phone,
      password: v.password, newsletter: v.newsletter
    }).subscribe({
      next: () => this._router.navigate(['/account/profile']),
      error: (err: Error) => {
        this.errorMsg = err.message;
        this.submitting = false;
        this._cdr.detectChanges();
      }
    });
  }

  onGoogle() {
    this.submitting = true;
    this._auth.loginWithGoogle().subscribe({
      next: () => {
        this.submitting = false;
        this._router.navigate(['/']);
      },
      error: () => {
        this.submitting = false;
        this._router.navigate(['/']);
      }
    });
  }
}
