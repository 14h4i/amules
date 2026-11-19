import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CatalogItem {
  _id?: any;
  id?: string;
  name: string;
  scientificName?: string;
  code?: string;
  slug?: string;
  description?: string;
  image?: string;
  color?: string;
  colorHex?: string;
  mohs?: string;
  crystalSystem?: string;
  opticalFeature?: string;
  metaphysicalMeaning?: string;
  dateRange?: string;
  element?: string;
  compatibleElements?: string[];
  productCount?: number;
  productIds?: any[];
  mysticMatchActive?: boolean;
  isVisible?: boolean;
}

@Component({
  selector: 'app-admin-catalog',
  standalone: false,
  templateUrl: './admin-catalog.component.html',
  styleUrl: './admin-catalog.component.css'
})
export class AdminCatalogComponent implements OnInit {
  activeTab: 'categories' | 'gemstones' | 'elements' | 'zodiac' | 'collections' = 'categories';
  loading = false;
  searchQuery = '';
  statusFilter: 'all' | 'active' | 'hidden' = 'all';
  sortBy: 'products_desc' | 'products_asc' | 'name_asc' | 'name_desc' = 'products_desc';
  toastMsg = '';
  products: any[] = [];

  // Edit / Create modal state matching "Sửa Dữ Liệu Nền.png"
  showEditModal = false;
  isCreating = false;
  editingItem: CatalogItem = {
    name: '',
    scientificName: '',
    code: '',
    slug: '',
    description: '',
    image: '',
    color: '',
    colorHex: '#E0F2FE',
    mohs: '6.0 - 6.5 Mohs (Feldspar)',
    crystalSystem: 'Monoclinic (Một nghiêng)',
    opticalFeature: 'Có hiện tượng quang học Adularescence lung linh màu lam mờ ảo như ánh trăng tròn, phản xạ ánh sáng kỳ diệu khi xoay chuyển.',
    metaphysicalMeaning: 'Talisman bảo hộ du hành ban đêm, xoa dịu cảm xúc lo âu, cân bằng năng lượng âm dương và kết nối trực giác sâu thẳm.',
    compatibleElements: ['Thủy', 'Kim'],
    mysticMatchActive: true,
    isVisible: true
  };

  availableElements = ['Mệnh Kim', 'Mệnh Mộc', 'Mệnh Thủy', 'Mệnh Hỏa', 'Mệnh Thổ'];

  // 1. Categories - 6 items matching MongoDB collection 'categories'
  categories: CatalogItem[] = [
    {
      _id: 'c1b562b77f9cfb0765d9f208',
      code: 'DM-VT',
      name: 'Vòng tay',
      slug: '/vong-tay',
      description: 'Danh mục vòng tay đá năng lượng AMULES',
      productCount: 5,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: '7d8a7ed01c97c9778766837b',
      code: 'DM-DC',
      name: 'Dây chuyền',
      slug: '/day-chuyen',
      description: 'Danh mục dây chuyền đá năng lượng AMULES',
      productCount: 5,
      isVisible: true,
      image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg'
    },
    {
      _id: '992048d03d0d69cf33067e07',
      code: 'DM-NH',
      name: 'Nhẫn',
      slug: '/nhan',
      description: 'Danh mục nhẫn đá năng lượng AMULES',
      productCount: 4,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: '5fadd06d453008a6c518bc9e',
      code: 'DM-BT',
      name: 'Bông tai',
      slug: '/bong-tai',
      description: 'Danh mục bông tai đá năng lượng AMULES',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg'
    },
    {
      _id: '869baa4a458a5d6513556c60',
      code: 'DM-CH',
      name: 'Charm đá',
      slug: '/charm-da',
      description: 'Danh mục charm đá đá năng lượng AMULES',
      productCount: 0,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: 'c326bff57cfa65f545d70517',
      code: 'DM-QT',
      name: 'Set quà tặng',
      slug: '/set-qua-tang',
      description: 'Danh mục set quà tặng đá năng lượng AMULES',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/9b/9f/9f/9b9f9f152363271f0c154f437b34def0.jpg'
    }
  ];

  // 2. Gemstones - 15 items matching MongoDB collection 'gemstones'
  gemstones: CatalogItem[] = [
    {
      _id: 'e8fa4939d35f1f813fa27449',
      code: 'GEM-001',
      name: 'Thạch anh trắng',
      slug: 'thach-anh-trang',
      scientificName: 'Quartz (Silicate)',
      description: 'Thanh lọc, khai mở trí tuệ minh triết',
      metaphysicalMeaning: 'Thanh lọc tâm trí, giải tỏa âu lo, kích hoạt luân xa vương miện',
      color: 'Trắng',
      colorHex: '#F8FAFC',
      mohs: 'Mohs 7.0',
      productCount: 0,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: '7f64349e172055022ffc91ee',
      code: 'GEM-002',
      name: 'Moonstone (Đá Mặt Trăng)',
      slug: 'moonstone',
      scientificName: 'Feldspar (Orthoclase)',
      description: 'Biểu tượng của trực giác, sự dịu dàng và cân bằng cảm xúc',
      metaphysicalMeaning: 'Khơi mở trực giác, nuôi dưỡng tính nữ, hộ mệnh bình an cho hành trình',
      color: 'Trắng ánh xanh, Xanh lam nhạt',
      colorHex: '#E0F2FE',
      mohs: 'Mohs 6.0 - 6.5',
      productCount: 5,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: '22a019914d19838939debf30',
      code: 'GEM-003',
      name: 'Aventurine',
      slug: 'aventurine',
      scientificName: 'Quartz (Aventurine)',
      description: 'Tái sinh, thu hút cơ hội và sự an yên',
      metaphysicalMeaning: 'Làm dịu cơn giận, khơi nguồn thịnh vượng và an vui may mắn',
      color: 'Xanh lá',
      colorHex: '#10B981',
      mohs: 'Mohs 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg'
    },
    {
      _id: 'bd5554ded846c2c015693991',
      code: 'GEM-004',
      name: 'Cẩm thạch xanh',
      slug: 'cam-thach-xanh',
      scientificName: 'Jadeite / Nephrite',
      description: 'Bình an, may mắn và bảo hộ trường thọ',
      metaphysicalMeaning: 'Nuôi dưỡng tâm từ bi, chiêu tài đắc lộc và che chở tai ương',
      color: 'Xanh lục',
      colorHex: '#059669',
      mohs: 'Mohs 6.5 - 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg'
    },
    {
      _id: '9dc53fb4f70a8d5f12597f44',
      code: 'GEM-005',
      name: 'Aquamarine (Ngọc Hải Lam)',
      slug: 'aquamarine',
      scientificName: 'Beryl (Cyclosilicate)',
      description: 'Chữa lành cảm xúc, dũng cảm và thanh lọc',
      metaphysicalMeaning: 'Sắc lam đại dương xoa dịu tâm trí, khai mở giao tiếp tự tin',
      color: 'Xanh dương nhạt',
      colorHex: '#38BDF8',
      mohs: 'Mohs 7.5 - 8.0',
      productCount: 3,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: 'bb3dcf919b6e828452fe3bfa',
      code: 'GEM-006',
      name: 'Thạch anh đen',
      slug: 'thach-anh-den',
      scientificName: 'Morion Quartz',
      description: 'Bảo vệ, xua tan năng lượng tiêu cực',
      metaphysicalMeaning: 'Lá chắn tâm linh vững chãi, hóa giải tà khí và vững tâm',
      color: 'Đen',
      colorHex: '#1E293B',
      mohs: 'Mohs 7.0',
      productCount: 0,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: 'b5b8c3ba50f8373b50c406ba',
      code: 'GEM-007',
      name: 'Kyanite',
      slug: 'kyanite',
      scientificName: 'Aluminosilicate',
      description: 'Kết nối trực giác, cân bằng luân xa và bình tĩnh',
      metaphysicalMeaning: 'Cầu nối năng lượng tâm linh, giúp thiền định tĩnh tại sâu sắc',
      color: 'Xanh lam đậm',
      colorHex: '#2563EB',
      mohs: 'Mohs 4.5 - 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg'
    },
    {
      _id: 'e1d272d5efbfb9c4c703d7c4',
      code: 'GEM-008',
      name: 'Thạch anh tím (Amethyst)',
      slug: 'thach-anh-tim',
      scientificName: 'Quartz (Silicate)',
      description: 'Giác ngộ tâm linh, thanh thản và giấc ngủ sâu',
      metaphysicalMeaning: 'Thanh lọc trường sinh học, giữ cho tâm trí luôn tĩnh lặng minh mẫn',
      color: 'Tím',
      colorHex: '#8B5CF6',
      mohs: 'Mohs 7.0',
      productCount: 2,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: 'cf6ebfc4adff2da33d6790b8',
      code: 'GEM-009',
      name: 'Garnet hồng',
      slug: 'garnet-hong',
      scientificName: 'Nesosilicate',
      description: 'Ngọn lửa đam mê, lòng can đảm và thịnh vượng tình duyên',
      metaphysicalMeaning: 'Hồi sinh năng lượng sống, đánh thức nhiệt huyết và lòng trắc ẩn',
      color: 'Hồng ánh đỏ',
      colorHex: '#F43F5E',
      mohs: 'Mohs 7.0 - 7.5',
      productCount: 0,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: '6e5d7688f18eabab3fcab6ff',
      code: 'GEM-010',
      name: 'Thạch anh vàng Citrine',
      slug: 'citrine',
      scientificName: 'Quartz (Silicate)',
      description: 'Viên đá của tài lộc, sự tự tin và niềm vui sống',
      metaphysicalMeaning: 'Hào quang rực rỡ mặt trời, chiêu tài tấn bảo và hanh thông sự nghiệp',
      color: 'Vàng mật ong',
      colorHex: '#FBBF24',
      mohs: 'Mohs 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: '4091c0bd9e1481c529283aea',
      code: 'GEM-011',
      name: 'Mắt hổ',
      slug: 'mat-ho',
      scientificName: 'Quartz Pseudomorph',
      description: 'Dũng khí, quyết đoán và bảo hộ quyền lực',
      metaphysicalMeaning: 'Ý chí kiên định như mãnh hổ, bảo vệ chủ nhân trước nghịch cảnh',
      color: 'Nâu vàng ánh lụa',
      colorHex: '#D97706',
      mohs: 'Mohs 7.0',
      productCount: 0,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg'
    },
    {
      _id: '01869e54a93ca3a886f76239',
      code: 'GEM-012',
      name: 'Thạch anh hồng',
      slug: 'thach-anh-hong',
      scientificName: 'Quartz (Silicate)',
      description: 'Tình yêu thuần khiết, vị tha và chữa lành cảm xúc tổn thương',
      metaphysicalMeaning: 'Kích hoạt luân xa tim, thu hút duyên lành và mở rộng lòng bao dung',
      color: 'Hồng phấn Madagascar',
      colorHex: '#F472B6',
      mohs: 'Mohs 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg'
    },
    {
      _id: '61a380e2270929944bfe100c',
      code: 'GEM-013',
      name: 'Ngọc trai tự nhiên',
      slug: 'ngoc-trai',
      scientificName: 'Organic Gemstone (Nacre)',
      description: 'Vẻ đẹp thanh khiết, quý phái và bình an viên mãn',
      metaphysicalMeaning: 'Kết tinh tinh hoa biển mẹ, tượng trưng cho phẩm hạnh cao quý',
      color: 'Trắng xà cừ',
      colorHex: '#FEF3C7',
      mohs: 'Mohs 2.5 - 4.5',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg'
    },
    {
      _id: 'e207e997f7fa205089c9e8ca',
      code: 'GEM-014',
      name: 'Thạch anh khói',
      slug: 'thach-anh-khoi',
      scientificName: 'Smoky Quartz',
      description: 'Nối kết đất mẹ, buông bỏ muộn phiền và cân bằng',
      metaphysicalMeaning: 'Định tâm vững chãi, chuyển hóa năng lượng tắc nghẽn thành an yên',
      color: 'Nâu khói lam',
      colorHex: '#78716C',
      mohs: 'Mohs 7.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: '83f14e52a5650d05df6e4f22',
      code: 'GEM-015',
      name: 'Fluorite',
      slug: 'fluorite',
      scientificName: 'Halide (Calcium Fluoride)',
      description: 'Trật tự tâm trí, tăng cường tập trung và sáng tạo',
      metaphysicalMeaning: 'Viên đá cầu vồng quang học, khai phóng luồng suy nghĩ độc đáo',
      color: 'Tím lam xanh đa sắc',
      colorHex: '#A855F7',
      mohs: 'Mohs 4.0',
      productCount: 1,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg'
    }
  ];

  // 3. Elements - 5 items matching MongoDB collection 'elements'
  elementsList: CatalogItem[] = [
    {
      _id: '2f282b13c139ff9174d71a7d',
      code: 'MENH-KIM',
      name: 'Mệnh Kim',
      element: 'Kim',
      description: 'Tập trung tinh thần, khơi mở trí tuệ minh triết và thu hút luồng khí hanh thông.',
      color: 'Trắng, Ánh kim, Xám bạc',
      productCount: 4,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: '9d26236c8e94bd24477f1d36',
      code: 'MENH-MOC',
      name: 'Mệnh Mộc',
      element: 'Mộc',
      description: 'Hàn gắn những vết nứt cảm xúc, vỗ về tâm hồn và ươm mầm sinh khí tươi mới.',
      color: 'Xanh lá, Xanh lục bảo',
      productCount: 4,
      isVisible: true,
      image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg'
    },
    {
      _id: '448a24f33e03c0d6d4c7ebe8',
      code: 'MENH-THUY',
      name: 'Mệnh Thủy',
      element: 'Thủy',
      description: 'Khai mở linh cảm nhạy bén, giúp tâm trí mềm mại thích ứng trước mọi biến thiên.',
      color: 'Lam biển dịu êm, Đen huyền bí',
      productCount: 8,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg'
    },
    {
      _id: '63a4bd3d02a3d5d97bb7d13a',
      code: 'MENH-HOA',
      name: 'Mệnh Hỏa',
      element: 'Hỏa',
      description: 'Thắp sáng niềm đam mê bất tận, sức quyến rũ tự nhiên và can đảm theo đuổi ước vọng.',
      color: 'Đỏ, Hồng, Tím hoàng gia',
      productCount: 4,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg'
    },
    {
      _id: '9ecaa79fef46d8f28fa8e547',
      code: 'MENH-THO',
      name: 'Mệnh Thổ',
      element: 'Thổ',
      description: 'Kiên cố nội lực, tiếp thêm sự nhẫn nại và nuôi dưỡng những mối liên kết bền vững.',
      color: 'Vàng sậm, Nâu đất, Cam mật ong',
      productCount: 3,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/b3/cf/e0/b3cfe07a389a61eaa7b0f186da90da4f.jpg'
    }
  ];

  // 4. Zodiac Signs - 12 items matching MongoDB collection 'zodiac_signs'
  zodiacSigns: CatalogItem[] = [
    { _id: 'bc840cf0f39e435344d641bc', name: 'Bạch Dương', dateRange: '21/03 - 19/04', element: 'Hỏa', description: 'Nhiệt huyết, tiên phong và giàu dũng khí', productCount: 0, isVisible: true, image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg' },
    { _id: '81e670d0f62bff08b80f31a7', name: 'Kim Ngưu', dateRange: '20/04 - 20/05', element: 'Thổ', description: 'Kiên định, ổn định và gu thẩm mỹ tinh tế', productCount: 1, isVisible: true, image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg' },
    { _id: '4a47607c1a70f9389a8d05d1', name: 'Song Tử', dateRange: '21/05 - 20/06', element: 'Khí', description: 'Thông minh, linh hoạt và giao tiếp cuốn hút', productCount: 0, isVisible: true, image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg' },
    { _id: 'ce84dd3716c6d1337db8a883', name: 'Cự Giải', dateRange: '21/06 - 22/07', element: 'Thủy', description: 'Trực giác sâu sắc, che chở và gắn kết gia đình', productCount: 6, isVisible: true, image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg' },
    { _id: 'b567dcfa694c96570abdcab1', name: 'Sư Tử', dateRange: '23/07 - 22/08', element: 'Hỏa', description: 'Tự tin, hào phóng và tỏa sáng vị thế', productCount: 1, isVisible: true, image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg' },
    { _id: 'f43cc45821e4b00bee346c5c', name: 'Xử Nữ', dateRange: '23/08 - 22/09', element: 'Thổ', description: 'Tỉ mỉ, chu đáo và hướng tới vẻ đẹp hoàn mỹ', productCount: 2, isVisible: true, image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg' },
    { _id: 'ff1c201639d67562f1da677c', name: 'Thiên Bình', dateRange: '23/09 - 22/10', element: 'Khí', description: 'Cân bằng, thanh lịch và hòa ái', productCount: 1, isVisible: true, image: 'https://i.pinimg.com/736x/82/af/ce/82afce704fa0702179286be2a3d293d7.jpg' },
    { _id: '01cf90e9df64639430c0c7d4', name: 'Bọ Cạp', dateRange: '23/10 - 21/11', element: 'Thủy', description: 'Huyền bí, kiên cường và trực cảm mãnh liệt', productCount: 0, isVisible: true, image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg' },
    { _id: '202abfa532fcbc28801ceb3a', name: 'Nhân Mã', dateRange: '22/11 - 21/12', element: 'Hỏa', description: 'Lạc quan, tự do và đam mê khám phá tri thức', productCount: 2, isVisible: true, image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg' },
    { _id: '0f0a47f5cc114d938b81ceeb', name: 'Ma Kết', dateRange: '22/12 - 19/01', element: 'Thổ', description: 'Kỷ luật, bản lĩnh và khát vọng bền bỉ', productCount: 1, isVisible: true, image: 'https://i.pinimg.com/736x/47/9c/df/479cdf269b5b50948b8aef6103b475ed.jpg' },
    { _id: '0289ab748d88fa7bfa635193', name: 'Bảo Bình', dateRange: '20/01 - 18/02', element: 'Khí', description: 'Độc bản, sáng tạo và tư duy nhân đạo đi trước thời đại', productCount: 2, isVisible: true, image: 'https://i.pinimg.com/1200x/5e/19/ca/5e19cae249717d1321564c81f14a1732.jpg' },
    { _id: 'dd7f1bcc31ea57bf8970bf38', name: 'Song Ngư', dateRange: '19/02 - 20/03', element: 'Thủy', description: 'Thấu cảm, lãng mạn và tâm hồn hướng thiện thuần khiết', productCount: 5, isVisible: true, image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg' }
  ];

  // 5. Collections - 3 items matching MongoDB collection 'collections'
  collections: CatalogItem[] = [
    {
      _id: 'a1b2c3d4e5f60718293a4b5c',
      code: 'BST-01',
      name: 'Mystical Vintage',
      slug: '/mystical-vintage',
      description: 'Dấu ấn hoàng gia phương Tây kết hợp chiều sâu chiêm nghiệm phương Đông.',
      productCount: 2,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
    },
    {
      _id: 'b2c3d4e5f6a708192a3b4c5d',
      code: 'BST-02',
      name: 'Moon & Stars',
      slug: '/moon-and-stars',
      description: 'Cảm hứng chu kỳ trăng tròn và 12 chòm sao dẫn lối với đá ánh trăng quyền năng.',
      productCount: 4,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
    },
    {
      _id: 'c3d4e5f6a7b8091a2b3c4d5e',
      code: 'BST-03',
      name: 'Nàng Thơ (The Muse)',
      slug: '/nang-tho',
      description: 'Vẻ đẹp tinh tế của ngọc trai tự nhiên và đá Aquamarine đánh thức nét dịu dàng tâm hồn.',
      productCount: 3,
      isVisible: true,
      image: 'https://i.pinimg.com/736x/8b/56/4e/8b564e66f5a26e5a7761873879e15a44.jpg'
    }
  ];

  constructor(private _http: HttpClient) {}

  ngOnInit(): void {
    this.loadBackendData();
  }

  loadBackendData(): void {
    // 1. Load Categories from database
    this._http.get<any[]>('/api/categories').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.categories = data.map((c, i) => {
            const fallback = this.categories[i % this.categories.length];
            return {
              ...fallback,
              ...c,
              name: c.name || fallback.name,
              code: c.code || fallback.code,
              slug: c.slug ? (c.slug.startsWith('/') ? c.slug : '/' + c.slug) : fallback.slug,
              description: c.description || fallback.description,
              image: this.resolveCatalogImage(c.image || fallback.image)
            };
          });
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });

    // 2. Load Gemstones from database
    this._http.get<any[]>('/api/gemstones').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.gemstones = data.map((g, i) => {
            const fallback = this.gemstones[i % this.gemstones.length];
            return {
              ...fallback,
              ...g,
              name: g.name || fallback.name,
              code: g.code || `GEM-${String(i + 1).padStart(3, '0')}`,
              slug: g.slug || fallback.slug,
              description: g.description || fallback.description,
              metaphysicalMeaning: g.meaning || g.description || fallback.metaphysicalMeaning,
              image: this.resolveCatalogImage(g.image || fallback.image)
            };
          });
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });

    // 3. Load Collections from database
    this._http.get<any[]>('/api/collections').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.collections = data.map((col, i) => {
            const fallback = this.collections[i % this.collections.length];
            return {
              ...fallback,
              ...col,
              name: col.name || fallback.name,
              code: col.code || `BST-${String(i + 1).padStart(2, '0')}`,
              slug: col.slug ? (col.slug.startsWith('/') ? col.slug : '/' + col.slug) : fallback.slug,
              description: col.description || col.desc || fallback.description,
              image: this.resolveCatalogImage(col.coverImage || col.image || fallback.image)
            };
          });
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });

    // 4. Load Elements
    this._http.get<any[]>('/api/elements').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.elementsList = data.map((e, i) => {
            const fallback = this.elementsList[i % this.elementsList.length];
            return {
              ...fallback,
              ...e,
              name: e.name || fallback.name
            };
          });
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });

    // 5. Load Zodiac Signs
    this._http.get<any[]>('/api/zodiac-signs').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.zodiacSigns = data.map((z, i) => {
            const fallback = this.zodiacSigns[i % this.zodiacSigns.length];
            return {
              ...fallback,
              ...z,
              name: z.name || fallback.name
            };
          });
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });

    // 6. Load Products to compute live dynamic counts across every catalog entity
    this._http.get<any[]>('/api/products').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.products = data;
          this.recalculateProductCounts();
        }
      },
      error: () => {}
    });
  }

  // Dynamic calculation of linked products for each category, gemstone, element, zodiac and collection
  recalculateProductCounts(): void {
    const products = this.products;
    if (!products || !products.length) return;

    const getOid = (v: any): string => {
      if (!v) return '';
      if (typeof v === 'string') return v;
      if (typeof v === 'object') {
        for (const k of Object.keys(v)) {
          if (k.endsWith('oid')) return String(v[k]);
        }
      }
      return String(v);
    };

    // 1. Categories
    this.categories.forEach(c => {
      const cId = getOid(c._id);
      const cSlug = (c.slug || '').replace(/^\//, '').toLowerCase();
      const cName = (c.name || '').toLowerCase();
      c.productCount = products.filter(p => {
        const pCatId = getOid(p.categoryId);
        const pCat = (p.category || '').toLowerCase();
        return (cId && pCatId === cId) ||
               (cSlug && pCat.includes(cSlug)) ||
               (cName && pCat.includes(cName));
      }).length;
    });

    // 2. Gemstones
    this.gemstones.forEach(g => {
      const gId = getOid(g._id);
      const gName = (g.name || '').toLowerCase();
      const gSlug = (g.slug || '').toLowerCase();
      g.productCount = products.filter(p => {
        const gemIds = (p.gemstoneIds || []).map(getOid);
        if (gId && gemIds.includes(gId)) return true;
        const pStone = (p.stone || p.gemstone || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return (gName && (pStone.includes(gName) || gName.includes(pStone))) ||
               (gSlug && pStone.includes(gSlug)) ||
               (gName && pName.includes(gName));
      }).length;
    });

    // 3. Elements
    this.elementsList.forEach(e => {
      const eId = getOid(e._id);
      const rawName = (e.name || '').replace('Mệnh ', '').trim().toLowerCase();
      e.productCount = products.filter(p => {
        const elIds = (p.elementIds || []).map(getOid);
        if (eId && elIds.includes(eId)) return true;
        const pEl = (p.element || '').toLowerCase();
        const pEls = Array.isArray(p.elements) ? p.elements.map((x: any) => String(x).toLowerCase()) : [];
        const pComp = Array.isArray(p.compatibleElements) ? p.compatibleElements.map((x: any) => String(x).toLowerCase()) : [];
        return pEl.includes(rawName) || pEls.some((x: string) => x.includes(rawName)) || pComp.some((x: string) => x.includes(rawName));
      }).length;
    });

    // 4. Zodiac Signs
    this.zodiacSigns.forEach(z => {
      const zId = getOid(z._id);
      const zName = (z.name || '').toLowerCase();
      z.productCount = products.filter(p => {
        const zIds = (p.zodiacIds || []).map(getOid);
        if (zId && zIds.includes(zId)) return true;
        const pZod = (p.zodiac || '').toLowerCase();
        const pZods = Array.isArray(p.zodiacSigns) ? p.zodiacSigns.map((x: any) => String(x).toLowerCase()) : [];
        const pComp = Array.isArray(p.compatibleZodiacs) ? p.compatibleZodiacs.map((x: any) => String(x).toLowerCase()) : [];
        const pName = (p.name || '').toLowerCase();
        return (zName && pZod.includes(zName)) ||
               pZods.some((x: string) => zName && x.includes(zName)) ||
               pComp.some((x: string) => zName && x.includes(zName)) ||
               (zName && pName.includes(zName));
      }).length;
    });

    // 5. Collections
    this.collections.forEach(col => {
      const colId = getOid(col._id);
      const colProdIds = (col.productIds || []).map(getOid);
      const colName = (col.name || '').toLowerCase();
      const colSlug = (col.slug || '').toLowerCase();
      col.productCount = products.filter(p => {
        const pId = getOid(p._id) || p.id;
        if (colProdIds.includes(pId)) return true;
        const pColId = getOid(p.collectionId);
        if (colId && pColId === colId) return true;
        const pCol = (p.collection || '').toLowerCase();
        return (colName && pCol.includes(colName)) || (colSlug && pCol.includes(colSlug));
      }).length;
    });
  }

  resolveCatalogImage(img?: string): string {
    return img || '';
  }

  get currentTabItems(): CatalogItem[] {
    if (this.activeTab === 'categories') return this.categories;
    if (this.activeTab === 'gemstones') return this.gemstones;
    if (this.activeTab === 'elements') return this.elementsList;
    if (this.activeTab === 'zodiac') return this.zodiacSigns;
    return this.collections;
  }

  get activeCountInTab(): number {
    return this.currentTabItems.filter(i => i.isVisible !== false).length;
  }

  get hiddenCountInTab(): number {
    return this.currentTabItems.filter(i => i.isVisible === false).length;
  }

  get currentList(): CatalogItem[] {
    let list: CatalogItem[] = [...this.currentTabItems];

    // 1. Lọc theo trạng thái hoạt động / tạm ẩn
    if (this.statusFilter === 'active') {
      list = list.filter(i => i.isVisible !== false);
    } else if (this.statusFilter === 'hidden') {
      list = list.filter(i => i.isVisible === false);
    }

    // 2. Lọc theo từ khóa tìm kiếm
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.scientificName || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.code || '').toLowerCase().includes(q) ||
        (i.slug || '').toLowerCase().includes(q) ||
        (i.element || '').toLowerCase().includes(q) ||
        (i.color || '').toLowerCase().includes(q)
      );
    }

    // 3. Sắp xếp theo tiêu chí người dùng chọn
    if (this.sortBy === 'products_desc') {
      list.sort((a, b) => (Number(b.productCount) || 0) - (Number(a.productCount) || 0));
    } else if (this.sortBy === 'products_asc') {
      list.sort((a, b) => (Number(a.productCount) || 0) - (Number(b.productCount) || 0));
    } else if (this.sortBy === 'name_asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'));
    } else if (this.sortBy === 'name_desc') {
      list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'vi'));
    }

    return list;
  }

  // Dynamic getters for stats and badges
  formatBadgeCount(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  }

  get totalLinkedProductsInTab(): number {
    return this.currentList.reduce((sum, item) => sum + (Number(item.productCount) || 0), 0);
  }

  get averageMohs(): string {
    const list = this.gemstones;
    if (!list.length) return '6.5';
    let sum = 0, count = 0;
    list.forEach(g => {
      if (g.mohs) {
        const matches = g.mohs.match(/[\d.]+/g);
        if (matches && matches.length > 0) {
          const vals = matches.map(Number);
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          sum += avg;
          count++;
        }
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '6.5';
  }

  get activeRate(): number {
    const list = this.currentList;
    if (!list.length) return 100;
    const active = list.filter(x => x.isVisible !== false).length;
    return Math.round((active / list.length) * 100);
  }

  get topCategoryName(): string {
    if (!this.categories.length) return 'Vòng tay';
    const sorted = [...this.categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    return sorted[0]?.name || 'Vòng tay';
  }

  get topCategoryPercentage(): number {
    const total = this.categories.reduce((s, c) => s + (c.productCount || 0), 0);
    if (!total) return 31;
    const sorted = [...this.categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    const topCount = sorted[0]?.productCount || 0;
    return Math.round((topCount / total) * 100);
  }

  openEditModal(item?: CatalogItem): void {
    if (item) {
      this.isCreating = false;
      this.editingItem = { ...item };
    } else {
      this.isCreating = true;
      this.editingItem = {
        code: 'NEW-' + Math.floor(Math.random() * 900 + 100),
        name: '',
        scientificName: '',
        description: '',
        image: 'https://i.pinimg.com/736x/d4/3c/3d/d43c3d69296b0badad1636033dd34e9c.jpg',
        colorHex: '#E0F2FE',
        mohs: '6.0 - 6.5 Mohs (Feldspar)',
        crystalSystem: 'Monoclinic (Một nghiêng)',
        opticalFeature: 'Hiệu ứng quang học lung linh phản xạ ánh sáng.',
        metaphysicalMeaning: 'Talisman bảo hộ phong thủy và kết nối năng lượng tốt lành.',
        compatibleElements: ['Thủy', 'Mộc'],
        mysticMatchActive: true,
        isVisible: true
      };
    }
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  toggleElementChip(elem: string): void {
    const raw = elem.replace('Mệnh ', '');
    if (!this.editingItem.compatibleElements) this.editingItem.compatibleElements = [];
    const idx = this.editingItem.compatibleElements.indexOf(raw);
    if (idx > -1) {
      this.editingItem.compatibleElements.splice(idx, 1);
    } else {
      this.editingItem.compatibleElements.push(raw);
    }
  }

  isElementActive(elem: string): boolean {
    const raw = elem.replace('Mệnh ', '');
    return (this.editingItem.compatibleElements || []).includes(raw);
  }

  saveEditItem(): void {
    if (!this.editingItem.name.trim()) return;

    if (this.isCreating) {
      if (this.activeTab === 'categories') this.categories.unshift({ ...this.editingItem });
      else if (this.activeTab === 'gemstones') this.gemstones.unshift({ ...this.editingItem });
      else if (this.activeTab === 'collections') this.collections.unshift({ ...this.editingItem });
      this.showToast('Đã thêm dữ liệu mới thành công!');
    } else {
      const list = this.currentList;
      const found = list.find(x => x.code === this.editingItem.code || x.name === this.editingItem.name);
      if (found) {
        Object.assign(found, this.editingItem);
      }
      this.showToast('Đã cập nhật dữ liệu nền thành công!');
    }
    this.showEditModal = false;
  }

  toggleVisibility(item: CatalogItem): void {
    item.isVisible = item.isVisible === false ? true : false;
    this.showToast(`Đã ${item.isVisible ? 'kích hoạt' : 'tạm ẩn'} trạng thái hiển thị của: ${item.name}`);
  }

  deleteItem(item: CatalogItem): void {
    if (confirm(`Bạn có chắc chắn muốn xóa "${item.name}" khỏi hệ thống?`)) {
      if (this.activeTab === 'categories') this.categories = this.categories.filter(x => x !== item);
      else if (this.activeTab === 'gemstones') this.gemstones = this.gemstones.filter(x => x !== item);
      else if (this.activeTab === 'collections') this.collections = this.collections.filter(x => x !== item);
      this.showToast(`Đã xóa "${item.name}"!`);
    }
  }

  showToast(msg: string): void {
    this.toastMsg = msg;
    setTimeout(() => (this.toastMsg = ''), 3500);
  }
}
