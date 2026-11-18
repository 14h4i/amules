import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MysticMatchToolComponent } from './mystic-match-tool.component';
import { AppModule } from '../app.module';

describe('MysticMatchToolComponent', () => {
  let component: MysticMatchToolComponent;
  let fixture: ComponentFixture<MysticMatchToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MysticMatchToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate initial zodiac and element correctly', () => {
    expect(component.calculatedZodiac).toBeTruthy();
    expect(component.calculatedElement).toBeTruthy();
  });

  it('should dynamically limit days based on month and year', () => {
    component.birthYear = 2016; // Năm nhuận
    component.birthMonth = 2;
    component.onMonthOrYearChange();
    expect(component.days.length).toBe(29);

    component.birthYear = 2026; // Năm thường
    component.birthMonth = 2;
    component.onMonthOrYearChange();
    expect(component.days.length).toBe(28);

    // Khi ngày đang là 31 mà chuyển sang tháng 2, ngày tự động hạ về ngày cuối tháng
    component.birthDay = 31;
    component.onMonthOrYearChange();
    expect(component.birthDay).toBe(28);
  });

  it('should correctly calculate Scorpio (Bọ Cạp) and Mệnh Thổ for 24/10/2006 even with string inputs', () => {
    // Test cả kiểu number và kiểu string từ <select>
    (component as any).birthDay = '24';
    (component as any).birthMonth = '10';
    (component as any).birthYear = '2006';

    component.calculateMatch();

    expect(component.calculatedZodiac?.name).toBe('Bọ Cạp');
    expect(component.calculatedZodiac?.latin).toBe('Scorpio');
    expect(component.calculatedZodiac?.dateRange).toBe('23/10 - 21/11');

    expect(component.calculatedElement?.name).toContain('Mệnh Thổ');
    expect(component.calculatedElement?.name).toContain('Ốc Thượng Thổ');
    expect(component.calculatedElement?.name).toContain('Bính Tuất');
  });

  it('should open auth modal when guest clicks saveToProfile', () => {
    component._authService.isLoggedIn.set(false);
    component.saveToProfile();
    expect(component.showAuthPromptModal).toBe(true);

    component.closeAuthModal();
    expect(component.showAuthPromptModal).toBe(false);
  });

  it('should normalize product images so rings, necklaces and bracelets have distinct images', () => {
    const braceletImg = component.normalizeProductImage({ name: 'Lắc tay Biển Xanh', price: 100, image: '' });
    const necklaceImg = component.normalizeProductImage({ name: 'Dây chuyền Bạc Nữ Merlia', price: 100, image: '' });
    const ringImg = component.normalizeProductImage({ name: 'Nhẫn Tinh Tú Venus', price: 100, image: '' });
    const earringImg = component.normalizeProductImage({ name: 'Bông tai Sao Bạc Baroque', price: 100, image: '' });

    expect(braceletImg).toContain('lac_tay_bien');
    expect(necklaceImg).toContain('dch_mix_da');
    expect(ringImg).toContain('nhan_tinh_tu');
    expect(earringImg).toContain('bong_tai');
    expect(necklaceImg).not.toBe(braceletImg);
    expect(ringImg).not.toBe(braceletImg);
  });
});
