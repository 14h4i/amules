import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  // Master data lists loaded directly from MongoDB
  categories: CatalogItem[] = [];
  gemstones: CatalogItem[] = [];
  collections: CatalogItem[] = [];
  elementsList: CatalogItem[] = [];
  zodiacSigns: CatalogItem[] = [];
  themes: CatalogItem[] = [];

  constructor(
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBackendData();
  }

  loadBackendData(): void {
    // 1. Load Categories directly from database
    this._http.get<any[]>('/api/categories').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.categories = data.map((c, i) => ({
            _id: c._id || c.id,
            id: c._id || c.id,
            code: c.code || `DM-${String(i + 1).padStart(2, '0')}`,
            name: c.name,
            slug: c.slug ? (c.slug.startsWith('/') ? c.slug : '/' + c.slug) : `/${c.name.toLowerCase()}`,
            description: c.description || `Danh mục ${c.name} đá năng lượng AMULES`,
            image: this.resolveCatalogImage(c.image),
            productCount: Number(c.productCount || 0),
            isVisible: c.isVisible !== false
          }));
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load categories error:', err)
    });

    // 2. Load Gemstones directly from database
    this._http.get<any[]>('/api/gemstones').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.gemstones = data.map((g, i) => ({
            _id: g._id || g.id,
            id: g._id || g.id,
            code: g.code || `GEM-${String(i + 1).padStart(3, '0')}`,
            name: g.name,
            scientificName: g.scientificName || g.name,
            slug: g.slug || g.name.toLowerCase().replace(/\s+/g, '-'),
            description: g.description || `Đá quý tự nhiên ${g.name}`,
            metaphysicalMeaning: g.meaning || g.metaphysicalMeaning || g.description || '',
            color: g.color || 'Đa sắc tự nhiên',
            colorHex: g.colorHex || '#E0F2FE',
            mohs: g.mohs || 'Mohs 6.5 - 7.5',
            crystalSystem: g.crystalSystem || 'Hệ lục phương',
            opticalFeature: g.opticalFeature || '',
            compatibleElements: Array.isArray(g.compatibleElements) ? g.compatibleElements : (g.element ? [g.element] : []),
            image: this.resolveCatalogImage(g.image),
            productCount: Number(g.productCount || 0),
            isVisible: g.isVisible !== false
          }));
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load gemstones error:', err)
    });

    // 3. Load Collections directly from database
    this._http.get<any[]>('/api/collections').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.collections = data.map((col, i) => ({
            _id: col._id || col.id,
            id: col._id || col.id,
            code: col.code || `BST-${String(i + 1).padStart(2, '0')}`,
            name: col.name,
            slug: col.slug ? (col.slug.startsWith('/') ? col.slug : '/' + col.slug) : `/${col.name.toLowerCase()}`,
            description: col.description || col.desc || `Bộ sưu tập ${col.name} độc bản AMULES`,
            image: this.resolveCatalogImage(col.coverImage || col.image),
            productCount: Number(col.productCount || (col.productIds ? col.productIds.length : 0)),
            isVisible: col.isVisible !== false
          }));
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load collections error:', err)
    });

    // 4. Load Elements directly from database
    this._http.get<any[]>('/api/elements').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.elementsList = data.map((e, i) => ({
            _id: e._id || e.id,
            id: e._id || e.id,
            code: e.code || `MENH-${String(e.name || i + 1).toUpperCase()}`,
            name: e.name,
            element: e.element || e.name.replace('Mệnh ', ''),
            description: e.description || `Năng lượng ngũ hành ${e.name}`,
            color: e.color || '',
            image: this.resolveCatalogImage(e.image),
            productCount: Number(e.productCount || 0),
            isVisible: e.isVisible !== false
          }));
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load elements error:', err)
    });

    // 5. Load Zodiac Signs directly from database
    this._http.get<any[]>('/api/zodiac-signs').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.zodiacSigns = data.map((z, i) => ({
            _id: z._id || z.id,
            id: z._id || z.id,
            name: z.name,
            dateRange: z.dateRange || z.dates || '',
            element: z.element || '',
            description: z.description || `Cung hoàng đạo ${z.name}`,
            image: this.resolveCatalogImage(z.image),
            productCount: Number(z.productCount || 0),
            isVisible: z.isVisible !== false
          }));
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load zodiac error:', err)
    });

    // 6. Load Products to compute live dynamic counts across every catalog entity
    this._http.get<any[]>('/api/products').subscribe({
      next: (data) => {
        if (data && data.length) {
          this.products = data;
          this.recalculateProductCounts();
        }
      },
      error: (err) => console.error('Load products for catalog count error:', err)
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
    this.elementsList.forEach((e: any) => {
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

    this._cdr.detectChanges();
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
