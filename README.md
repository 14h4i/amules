# AMULES - NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ TRANG SỨC & BÙA HỘ MỆNH CHIÊM TINH
---

## 🌟 GIỚI THIỆU DỰ ÁN
**AMULES** là nền tảng thương mại điện tử chuyên biệt về trang sức đá quý thiên nhiên kết hợp năng lượng phong thủy ngũ hành và bản đồ sao chiêm tinh học. Dự án được xây dựng theo kiến trúc Full-Stack hiện đại:
- **Frontend:** Single Page Application (SPA) phát triển bằng **Angular Framework** với công nghệ reactive signals, route guards, dynamic layouts và modular architecture.
- **Backend:** **Node.js** & **Express.js** cung cấp hệ thống RESTful API hoàn chỉnh, xử lý Session, Cookie, xác thực phân quyền và upload file.
- **Cơ sở dữ liệu:** **MongoDB** lưu trữ dữ liệu dạng Document phi cấu trúc với cơ chế **Auto-Seed** tự động khởi tạo dữ liệu mẫu phong phú.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN
```text
amules/
├── backend/                       # Web Server RESTful API (NodeJS + ExpressJS + MongoDB)
│   ├── config/
│   │   └── db.js                 # Cấu hình kết nối MongoDB native driver
│   ├── public/
│   │   └── images/               # Thư mục lưu trữ hình ảnh bảo vật & upload
│   ├── index.js                  # Điểm khởi chạy Express Server, middleware & API routes
│   └── package.json              # Express, MongoDB, CORS, Express-Session, Cookie-Parser...
│
├── frontend/                      # Client Single Page Application (Angular Framework)
│   ├── src/
│   │   ├── app/                  # Components, Modules, Services, Guards, Layouts
│   │   │   ├── admin/            # Phân hệ Quản trị viên (Dashboard, Sản phẩm, Đơn hàng, Users...)
│   │   │   ├── account/          # Phân hệ Khách hàng (Hồ sơ, Đơn hàng, Sổ địa chỉ, Ưu đãi...)
│   │   │   ├── products/         # Danh sách & Chi tiết bảo vật đá quý
│   │   │   ├── checkout/         # Giỏ hàng & Thanh toán đặt hàng
│   │   │   ├── mystic-match/     # Công cụ chiêm tinh & ngũ hành tương sinh
│   │   │   ├── services/         # MasterData, Product, Cart, Auth, Admin Services
│   │   │   └── guards/           # AuthGuard, AdminGuard, CheckoutGuard
│   │   ├── proxy.conf.json       # Proxy chuyển tiếp request /api -> http://localhost:3002
│   │   └── index.html            # SPA Entry point & Favicon
│   ├── public/                   # Static assets (Hình ảnh banner, logo, icon)
│   ├── angular.json              # Cấu hình Angular CLI
│   └── package.json              # Angular dependencies
│
├── amules-database/              # Bộ dữ liệu mẫu JSON ban đầu nạp vào MongoDB
│   ├── products.json             # Danh mục sản phẩm đá quý phong thủy
│   ├── categories.json           # Nhóm danh mục trang sức
│   ├── elements.json             # Ngũ hành: Kim, Mộc, Thủy, Hỏa, Thổ
│   ├── zodiac_signs.json         # 12 Cung hoàng đạo chiêm tinh
│   ├── collections.json          # Bộ sưu tập độc bản
│   ├── themes.json               # Chủ đề năng lượng đá quý
│   ├── users.json                # Dữ liệu tài khoản quản trị & khách hàng
│   ├── vouchers.json             # Mã giảm giá & ưu đãi
│   └── ...
├── package.json                  # Root npm scripts điều khiển cả 2 phía
├── .gitignore                    # Cấu hình loại bỏ node_modules, dist, cache
└── README.md                     # Tài liệu giới thiệu & hướng dẫn vận hành
```

---

## 🔑 TÀI KHOẢN TRẢI NGHIỆM & KIỂM THỬ (DEMO ACCOUNTS)

| Vai trò (Role) | Tài khoản / Email | Mật khẩu (Password) | Quyền hạn truy cập |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@amules.vn` *(hoặc `admin`)* | `admin123` *(hoặc `123456`)* | Toàn quyền Dashboard, Quản lý sản phẩm, Đơn hàng, Voucher, Khách hàng |
| **Khách hàng (Customer)** | `lananh.gemini@gmail.com` | `123456` | Khách hàng VIP: Xem giỏ hàng, Lịch sử mua hàng, Đánh giá, Điểm thưởng |
| **Khách hàng mới** | Bạn có thể tự Đăng ký tại `/register` | Mật khẩu tùy chọn | Trải nghiệm toàn bộ luồng mua hàng và tích điểm từ đầu |

---

## 🧭 BẢNG DANH MỤC CÁC TRANG & ROUTING

### 1. Phân hệ Khách hàng (Storefront)
| Đường dẫn URL | Tên trang / Chức năng | Mô tả chi tiết |
|---|---|---|
| `/` | **Trang chủ** | Banner tương tác trực tiếp tới chi tiết sản phẩm, cam kết chất lượng, bảo vật bán chạy, ngũ hành tương sinh, cẩm nang |
| `/products` | **Cửa hàng / Danh mục** | Bộ lọc đa tiêu chí (Danh mục, Ngũ hành, Loại đá, Mức giá), Tìm kiếm real-time, Sắp xếp giá / mới nhất |
| `/products/:slug` | **Chi tiết bảo vật** | SEO-friendly URL, Gallery hình ảnh, Phân loại kích cỡ, Năng lượng ngũ hành, Đánh giá thực tế, Thêm vào giỏ / Mua ngay |
| `/cart` | **Giỏ hàng** | Cập nhật số lượng tức thì, áp mã voucher giảm giá, thanh tiến trình miễn phí vận chuyển |
| `/checkout` | **Thanh toán & Đặt hàng** | Form địa chỉ thông minh, chọn phương thức vận chuyển và thanh toán (COD / Chuyển khoản QR) |
| `/order-success/:code` | **Đặt hàng thành công** | Hiển thị mã vận đơn chuẩn `AMU-XXXX`, ngày giao dự kiến, tiến trình xử lý |
| `/order-lookup` | **Tra cứu đơn hàng** | Tra cứu nhanh lộ trình đơn hàng dành cho khách vãng lai không cần đăng nhập |
| `/mystic-match` | **Mystic Match™** | Công cụ trắc nghiệm chiêm tinh học & ngũ hành Can Chi, đề xuất bảo vật tương hợp bản mệnh |
| `/collections` | **Bộ sưu tập** | Các bộ sưu tập độc bản: Moon & Stars, Mystical Vintage, Nàng Thơ... |
| `/themes` | **Khám phá theo chủ đề** | 8 chủ đề năng lượng đá quý (Tình yêu, Bình an, Tự tin, May mắn, Chữa lành...) |
| `/articles` | **Cẩm nang về đá** | Kiến thức thanh tẩy, nạp năng lượng và bảo quản đá thiên nhiên |
| `/about` | **Về AMULES** | Triết lý thương hiệu, nghệ nhân chế tác và sứ mệnh năng lượng |
| `/login` & `/register` | **Đăng nhập & Đăng ký** | Xác thực tài khoản, kiểm tra mật khẩu Reactive Form, hỗ trợ lưu session/cookie |

### 2. Phân hệ Quản lý tài khoản cá nhân (Customer Account)
| Đường dẫn URL | Chức năng | Mô tả |
|---|---|---|
| `/account/profile` | **Hồ sơ cá nhân** | Thông tin cá nhân, ngày sinh, bản mệnh ngũ hành, cỡ tay |
| `/account/orders` | **Lịch sử đơn hàng** | Danh sách đơn hàng theo trạng thái, tiến trình giao hàng |
| `/account/orders/:id` | **Chi tiết đơn hàng** | Chi tiết kiện hàng, địa chỉ, phương thức thanh toán |
| `/account/addresses` | **Sổ địa chỉ** | Quản lý danh sách địa chỉ nhận hàng, thiết lập địa chỉ mặc định |
| `/account/wishlist` | **Bảo vật yêu thích** | Danh sách bảo vật phong thủy đã lưu |
| `/account/rewards` | **Điểm & Ưu đãi** | Điểm năng lượng tích lũy, kho voucher cá nhân |
| `/account/reviews` | **Đánh giá của tôi** | Lịch sử nhận xét và xếp hạng sao cho các sản phẩm đã mua |
| `/account/security` | **Bảo mật tài khoản** | Đổi mật khẩu, quản lý phiên đăng nhập |

### 3. Phân hệ Quản trị viên (Admin Portal)
| Đường dẫn URL | Chức năng | Mô tả |
|---|---|---|
| `/admin/login` | **Đăng nhập Admin** | Cổng đăng nhập bảo mật dành riêng cho ban quản trị |
| `/admin/dashboard` | **Bảng điều khiển** | Thống kê doanh thu, số lượng đơn hàng, số khách hàng, biểu đồ tổng quan |
| `/admin/products` | **Quản lý Sản phẩm** | Thêm mới, chỉnh sửa thông tin, giá, phân loại mệnh, kho hàng, hình ảnh |
| `/admin/catalog` | **Dữ liệu nền & BST** | Quản lý danh mục, loại đá quý, bản mệnh, cung hoàng đạo, bộ sưu tập |
| `/admin/orders` | **Quản lý Đơn hàng** | Duyệt đơn, cập nhật trạng thái vận chuyển, xử lý hoàn hủy đơn |
| `/admin/vouchers` | **Quản lý Khuyến mãi** | Tạo và quản lý mã voucher giảm giá, ngày hết hạn, lượt sử dụng |
| `/admin/users` | **Quản lý Khách hàng** | Danh sách người dùng, cấp bậc VIP, điểm thưởng, khóa/mở tài khoản |

---

## 🛠️ YÊU CẦU HỆ THỐNG
1. **Node.js**: Phiên bản 18 trở lên (Khuyến nghị bản LTS v20.x).
2. **MongoDB Community Server**: Đang chạy tại cổng mặc định `mongodb://127.0.0.1:27017`.
   *(Nếu chưa cài MongoDB, hệ thống Backend đã tích hợp sẵn cơ chế **Fallback JSON Memory Mode** tự động đọc dữ liệu mẫu từ thư mục `amules-database` để trang web luôn hoạt động trơn tru).*
3. **NPM**: Đã tích hợp sẵn cùng Node.js.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Cách 1: Khởi chạy từng phân hệ độc lập (Khuyên dùng)

#### Bước 1: Khởi chạy Backend API Server (Cổng 3002)
Mở cửa sổ dòng lệnh tại thư mục `backend`:
```bash
cd backend
npm install
npm start
```
> Server API sẽ chạy tại: **http://localhost:3002**  
> *(Hệ thống tự động kết nối MongoDB database `amules` và tự động nạp các collection mẫu ban đầu).*

#### Bước 2: Khởi chạy Frontend Angular (Cổng 4200)
Mở cửa sổ dòng lệnh thứ hai tại thư mục `frontend`:
```bash
cd frontend
npm install
npm start
```
> Ứng dụng web sẽ mở tại: **http://localhost:4200**  
> *(Tất cả yêu cầu gọi `/api/*` sẽ tự động được chuyển tiếp tới backend thông qua proxy cấu hình sẵn).*

---

### Cách 2: Khởi chạy nhanh từ thư mục gốc `amules`
Từ thư mục gốc `amules`:
- Chạy backend: `npm run start:backend`
- Chạy frontend: `npm run start:frontend`

---

## 💡 CÁC TIÊU CHÍ KỸ THUẬT ĐẠT CHUẨN MÔN HỌC
- **Angular Core & Modern Architecture:** Áp dụng Reactive Signals (`signal()`, `set()`, `update()`), Computed values và Dependency Injection đồng nhất.
- **New Control Flow:** Toàn bộ template sử dụng cú pháp compile-time mới `@if`, `@else`, `@for (... track ...)`, `@empty`.
- **Reactive Forms & Validation:** Hệ thống form đăng ký, thanh toán, đổi mật khẩu được kiểm tra tính hợp lệ chặt chẽ (Pattern, MinLength, Custom Validators).
- **Navigation & Route Guards:** Bảo vệ các tuyến đường riêng tư với `AuthGuard`, `AdminGuard`, `CheckoutGuard`, đồng thời lưu trữ lịch sử điều hướng.
- **RESTful API & Database Integration:** Đầy đủ chuẩn CRUD (Create, Read, Update, Delete) với Express Router và MongoDB native collections.
- **Session & Cookie Security:** Quản lý phiên làm việc bằng `express-session`, bảo mật cookie và xác thực phân quyền giữa Khách hàng và Admin.
