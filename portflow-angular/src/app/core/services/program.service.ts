import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Program } from '../models/post';
import { environment } from '../../../environments/environment';

export interface ProgramPage {
  count: number;
  next: string | null;
  results: Program[];
}

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/programs`;

  list(search = ''): Observable<ProgramPage> {
    const params: Record<string, string> = {};
    if (search) params['search'] = search;
    return this.http.get<ProgramPage>(`${this.api}/`, { params });
  }
}
