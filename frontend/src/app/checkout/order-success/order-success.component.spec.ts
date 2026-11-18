import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderSuccessComponent } from './order-success.component';
import { AppModule } from '../../app.module';

describe('OrderSuccessComponent', () => {
  let component: OrderSuccessComponent;
  let fixture: ComponentFixture<OrderSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have order code initialized', () => {
    expect(component.orderCode).toBeDefined();
  });
});
