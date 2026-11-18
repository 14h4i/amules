import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppModule } from '../../app.module';

import { OrderDetailComponent } from './order-detail.component';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle cancel and return modals', () => {
    component.openCancelModal();
    expect(component.showCancelModal).toBe(true);
    component.closeCancelModal();
    expect(component.showCancelModal).toBe(false);

    component.openReturnModal();
    expect(component.showReturnModal).toBe(true);
    component.closeReturnModal();
    expect(component.showReturnModal).toBe(false);
  });
});
