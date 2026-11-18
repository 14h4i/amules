import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminCatalogComponent } from './admin-catalog.component';
import { AppModule } from '../../app.module';

describe('AdminCatalogComponent', () => {
  let component: AdminCatalogComponent;
  let fixture: ComponentFixture<AdminCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch active tabs correctly', () => {
    component.activeTab = 'gemstones';
    expect(component.currentTabItems).toBe(component.gemstones);
    expect(component.currentList.length).toBe(component.gemstones.length);

    component.activeTab = 'collections';
    expect(component.currentTabItems).toBe(component.collections);
    expect(component.currentList.length).toBe(component.collections.length);
  });

  it('should toggle item visibility', () => {
    const item = { name: 'Test Item', isVisible: true };
    component.toggleVisibility(item);
    expect(item.isVisible).toBe(false);
    component.toggleVisibility(item);
    expect(item.isVisible).toBe(true);
  });
});
