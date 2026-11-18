import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { IconComponent } from './shared/icon/icon.component';
import { HomeComponent } from './home/home.component';
import { HeroBannerComponent } from './home/hero-banner/hero-banner.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

import { AccountLayoutComponent } from './account/account-layout/account-layout.component';
import { OverviewComponent } from './account/overview/overview.component';
import { ProfileComponent } from './account/profile/profile.component';
import { AddressesComponent } from './account/addresses/addresses.component';
import { OrdersComponent } from './account/orders/orders.component';
import { OrderDetailComponent } from './account/order-detail/order-detail.component';
import { WishlistComponent } from './account/wishlist/wishlist.component';
import { ReviewsComponent } from './account/reviews/reviews.component';
import { MysticMatchComponent } from './account/mystic-match/mystic-match.component';
import { RewardsComponent } from './account/rewards/rewards.component';
import { SecurityComponent } from './account/security/security.component';

import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderSuccessComponent } from './checkout/order-success/order-success.component';
import { MysticMatchToolComponent } from './mystic-match/mystic-match-tool.component';
import { CollectionsComponent } from './collections/collections.component';
import { ThemesComponent } from './themes/themes.component';
import { ArticlesComponent } from './articles/articles.component';
import { AboutComponent } from './about/about.component';
import { GiftsComponent } from './gifts/gifts.component';

import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { AdminVouchersComponent } from './admin/admin-vouchers/admin-vouchers.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AdminCatalogComponent } from './admin/admin-catalog/admin-catalog.component';
import { OrderLookupComponent } from './order-lookup/order-lookup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

registerLocaleData(localeVi);

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HeaderComponent,
    FooterComponent,
    IconComponent,
    HomeComponent,
    HeroBannerComponent,
    LoginComponent,
    RegisterComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    OrderSuccessComponent,
    MysticMatchToolComponent,
    CollectionsComponent,
    ThemesComponent,
    ArticlesComponent,
    AboutComponent,
    GiftsComponent,
    AccountLayoutComponent,
    OverviewComponent,
    ProfileComponent,
    AddressesComponent,
    OrdersComponent,
    OrderDetailComponent,
    WishlistComponent,
    ReviewsComponent,
    MysticMatchComponent,
    RewardsComponent,
    SecurityComponent,
    AdminLayoutComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminProductsComponent,
    AdminOrdersComponent,
    AdminVouchersComponent,
    AdminUsersComponent,
    AdminCatalogComponent,
    OrderLookupComponent,
    ForgotPasswordComponent
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'vi' },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }