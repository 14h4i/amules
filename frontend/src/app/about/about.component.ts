import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  values = [
    { title: '100% Đá Tự Nhiên Giám Định', desc: 'Mọi tạo tác đá quý từ AMULES đều trải qua kiểm định ngọc học nghiêm ngặt bởi các trung tâm uy tín VGC, PNJ Lab.', icon: 'gem' },
    { title: 'Chế Tác Thủ Công Tinh Xảo', desc: 'Mỗi đường viền bạc S925 và giác cắt đá đều được các nghệ nhân kim hoàn lành nghề hoàn thiện tỉ mỉ bằng tay.', icon: 'sparkle' },
    { title: 'Thanh Tẩy Năng Lượng Thuần Khiết', desc: 'Bảo vật được xông trầm hương và thanh tẩy bằng chuông xoay Tây Tạng trước khi niêm phong gửi đến bạn.', icon: 'moon' },
    { title: 'Bảo Hành & Làm Mới Trọn Đời', desc: 'Chính sách làm mới đá, đánh bóng bạc và xâu lại dây vĩnh viễn không giới hạn số lần cho thành viên.', icon: 'shield-check' }
  ];
}
