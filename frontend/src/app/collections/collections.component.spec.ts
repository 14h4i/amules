import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionsComponent } from './collections.component';
import { AppModule } from '../app.module';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize collections array', () => {
    expect(component.collections).toBeDefined();
  });
});
