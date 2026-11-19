import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-articles',
  standalone: false,
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  selectedArticle: any = null;
  loading = true;

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient
  ) { }

  ngOnInit(): void {
    let routeSlug = '';
    this._route.params.subscribe(params => {
      routeSlug = (params['slug'] || '').toLowerCase();
      if (routeSlug && this.articles.length > 0) {
        const found = this.articles.find(a => (a.slug || '').toLowerCase() === routeSlug || (a._id && a._id === routeSlug));
        if (found) this.selectedArticle = found;
      }
    });

    this._http.get<any[]>('/api/articles').subscribe({
      next: (data) => {
        this.articles = (data && data.length > 0) ? data.map(a => ({
          ...a,
          image: a.image || a.thumbnail || '',
          category: a.category || a.tag || 'CẨM NANG NĂNG LƯỢNG',
          readTime: a.readTime || a.read || '5 phút đọc',
          excerpt: a.excerpt || a.summary || a.description || ''
        })) : [];
        if (routeSlug) {
          const found = this.articles.find(a => (a.slug || '').toLowerCase() === routeSlug || (a._id && a._id === routeSlug));
          if (found) this.selectedArticle = found;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  readArticle(a: any): void {
    this.selectedArticle = a;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedArticle = null;
  }
}
