import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hiring } from '../models/profile';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HiringService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/hiring`;

  list(): Observable<Hiring[]> {
    return this.http.get<{ results: Hiring[] }>(`${this.api}/`).pipe(map(res => res.results));
  }
}
