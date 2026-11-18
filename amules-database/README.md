# AMULES – JSON dữ liệu mẫu (MongoDB)

21 file = 21 collection, cấu trúc trường khớp đúng các bảng 3.18 – 3.39 trong mục 3.5 (collection `sessions` do connect-mongo tự tạo).
Định dạng MongoDB Extended JSON (`$oid`, `$date`), nhập bằng `./import.sh`.
Ảnh là đường dẫn giữ chỗ `https://cdn.amules.vn/...`, cần thay bằng link thật.
`passwordHash` là chuỗi giữ chỗ. Nội dung chiêm tinh/ngũ hành chỉ là dữ liệu mẫu, chỉ mang tính tham khảo.

## Ánh xạ trang Figma → collection
| Trang | Collection |
|---|---|
| Trang chủ | banners, categories, elements, gemstones, products, collections, articles |
| Danh sách / Chi tiết sản phẩm | products, categories, gemstones, reviews |
| Bộ sưu tập; Chủ đề | collections, themes, products |
| Mystic Match | elements, gemstones, products |
| Giỏ hàng | carts, vouchers |
| Thanh toán & Đặt hàng | orders, payments, vouchers, users.addresses |
| Đăng ký / Đăng nhập / Bảo mật | users |
| Tài khoản: hồ sơ, sổ địa chỉ | users |
| Tài khoản: đơn hàng | orders, return_requests |
| Tài khoản: yêu thích / đánh giá | wishlists / reviews |
| Tài khoản: điểm và ưu đãi | point_transactions, vouchers, notifications |
| Tài khoản: Mystic Match của tôi | mystic_match_sessions, mystic_match_recommendations |
| Admin | tổng hợp từ orders, products, reviews |

## Dữ liệu trên Figma chưa có trường lưu trong mục 3.5
Nhãn sản phẩm (Bán chạy, Hot), số lượt đã bán, mã kiểm định, tùy chọn chất liệu/kích cỡ riêng, các tab nội dung chi tiết, combo, phương thức vận chuyển, lời nhắn quà tặng, lịch sử trạng thái đơn. Cần bổ sung vào mục 3.5 hoặc bỏ khỏi giao diện.
