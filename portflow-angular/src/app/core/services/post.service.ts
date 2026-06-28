import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostFeed, PostDetail } from '../models/post';
import { environment } from '../../../environments/environment';

export interface PostPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostFeed[];
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/posts`;

  list(params: { page?: number; search?: string } = {}): Observable<PostPage> {
    const p: Record<string, string | number> = {};
    if (params.page !== undefined) p['page'] = params.page;
    if (params.search) p['search'] = params.search;
    return this.http.get<PostPage>(`${this.api}/`, { params: p });
  }

  get(id: number | string): Observable<PostDetail> {
    return this.http.get<PostDetail>(`${this.api}/${id}/`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}
