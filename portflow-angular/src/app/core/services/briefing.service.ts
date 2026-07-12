import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Briefing } from '../models/briefing';

@Injectable({
  providedIn: 'root',
})
export class BriefingService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/briefings`;

  create(data: FormData): Observable<Briefing> {
    return this.http.post<Briefing>(`${this.api}/`, data);
  }

  accept(id: number): Observable<Briefing> {
    return this.http.post<Briefing>(`${this.api}/${id}/accept/`, {});
  }

  decline(id: number, declineReason: string): Observable<Briefing> {
    return this.http.post<Briefing>(`${this.api}/${id}/decline/`, { decline_reason: declineReason });
  }
}
