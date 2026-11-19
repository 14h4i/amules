import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  loading = false;
  private _routeSlug = '';

  constructor(
    private _route: ActivatedRoute,
    private _http: HttpClient,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this._routeSlug = (params['slug'] || '').toLowerCase();
      this.checkSelectedArticle();
      this._cdr.detectChanges();
    });

    this.fetchArticles();
  }

  fetchArticles(): void {
    this.loading = true;
    this._http.get<any[]>('/api/articles').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.articles = data.map(a => ({
            ...a,
            image: a.image || a.thumbnail || '',
            thumbnail: a.thumbnail || a.image || '',
            category: a.category || a.tag || 'CẨM NANG NĂNG LƯỢNG',
            readTime: a.readTime || a.read || '5 phút đọc',
            excerpt: a.excerpt || a.summary || a.description || '',
            content: a.content || a.excerpt || a.summary || ''
          }));
        } else {
          this.articles = [];
        }
        this.checkSelectedArticle();
        this.loading = false;
        this._cdr.detectChanges();
      },
      error: () => {
        this.articles = [];
        this.loading = false;
        this._cdr.detectChanges();
      }
    });
  }

  private checkSelectedArticle(): void {
    if (!this._routeSlug || this.articles.length === 0) return;
    const found = this.articles.find(a =>
      (a.slug || '').toLowerCase() === this._routeSlug ||
      (a._id && a._id.toString() === this._routeSlug)
    );
    if (found) {
      this.selectedArticle = found;
    }
  }

  readArticle(a: any): void {
    this.selectedArticle = a;
    this._cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedArticle = null;
    this._cdr.detectChanges();
  }
}
