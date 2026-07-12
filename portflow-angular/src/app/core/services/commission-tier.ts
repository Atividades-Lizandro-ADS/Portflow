import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tier } from '../models/tier';

@Injectable({
  providedIn: 'root',
})
export class CommissionTier {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/commission-tiers`;

  get(id: number | string): Observable<Tier> {
    return this.http.get<Tier>(`${this.api}/${id}/`);
  }

  create(data: FormData): Observable<Tier> {
    return this.http.post<Tier>(`${this.api}/`, data);
  }

  update(id: number, data: FormData): Observable<Tier> {
    return this.http.patch<Tier>(`${this.api}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}
