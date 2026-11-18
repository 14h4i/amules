import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { AppModule } from '../../app.module';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default filter state', () => {
    expect(component.filters.priceRange).toBe('all');
    expect(component.filters.sort).toBe('newest');
  });

  it('should select category immediately on selectCategory call', () => {
    component.selectCategory('rings');
    expect(component.filters.category).toBe('rings');

    component.selectCategory('');
    expect(component.filters.category).toBe('');
  });

  it('should assign distinct images based on product type to prevent image duplication', () => {
    const ringImg = component.normalizeProductImage({ name: 'Nhẫn Tinh Tú Venus', price: 450000, image: '' });
    const necklaceImg = component.normalizeProductImage({ name: 'Dây chuyền Merlia', price: 650000, image: '' });
    const braceletImg = component.normalizeProductImage({ name: 'Lắc tay Biển Xanh', price: 590000, image: '' });

    expect(ringImg).toContain('nhan_tinh_tu');
    expect(necklaceImg).toContain('dch_mix_da');
    expect(braceletImg).toContain('lac_tay_bien');
    expect(ringImg).not.toBe(braceletImg);
    expect(necklaceImg).not.toBe(braceletImg);
  });
});
