import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostImage } from '../models/post';
import { environment } from '../../../environments/environment';

interface PostImagePatch {
  caption?: string;
  acessibility_caption?: string;
  cell_size_x?: string;
  cell_size_y?: string;
  is_mature?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostImageService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/post-images`;

  update(id: number, data: PostImagePatch): Observable<PostImage> {
    return this.http.patch<PostImage>(`${this.api}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}
