import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderLookupComponent } from './order-lookup.component';
import { AppModule } from '../app.module';

describe('OrderLookupComponent', () => {
  let component: OrderLookupComponent;
  let fixture: ComponentFixture<OrderLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate empty input before search', () => {
    component.orderCode = '';
    component.contact = '';
    component.onSearch();
    expect(component.errorMsg).toContain('Vui lòng nhập đầy đủ');
  });

  it('should correctly open and close cancel modal', () => {
    component.openCancelModal();
    expect(component.showCancelModal).toBe(true);
    component.closeCancelModal();
    expect(component.showCancelModal).toBe(false);
  });
});
