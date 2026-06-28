import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/post';
import { environment } from '../../../environments/environment';

export interface CommentPage {
  count: number;
  next: string | null;
  results: Comment[];
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/comments`;

  list(postId: number): Observable<CommentPage> {
    return this.http.get<CommentPage>(`${this.api}/`, { params: { post: postId } });
  }

  create(postId: number, text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/`, { comment_post: postId, comment_text: text });
  }

  update(id: number, text: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.api}/${id}/`, { comment_text: text });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}
