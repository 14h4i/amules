import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AppModule } from '../app.module';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate invalid email', () => {
    component.email = 'invalid-email';
    component.onSubmit();
    expect(component.errorMsg).toContain('email hợp lệ');
  });

  it('should submit successfully with valid email', () => {
    component.email = 'test@amules.com';
    component.onSubmit();
    expect(component.errorMsg).toBe('');
  });
});
