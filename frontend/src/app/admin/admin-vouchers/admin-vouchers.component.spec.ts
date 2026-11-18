import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { AppModule } from '../../app.module';
import { AdminVouchersComponent } from './admin-vouchers.component';

describe('AdminVouchersComponent', () => {
  let component: AdminVouchersComponent;
  let fixture: ComponentFixture<AdminVouchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule, RouterModule.forRoot([])],
      providers: [provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVouchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
