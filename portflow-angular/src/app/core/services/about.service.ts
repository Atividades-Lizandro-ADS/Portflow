import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AboutUpdatePayload {
  summary: string;
  hiring: number[];
  skills: number[];
  programs_known: number[];
}

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/about`;

  update(id: number, data: AboutUpdatePayload): Observable<unknown> {
    return this.http.patch(`${this.api}/${id}/`, data);
  }
}
