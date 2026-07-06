import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../models/profile';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/profiles`;

  get(id: number | string): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/${id}/`);
  }

  update(id: number | string, data: FormData): Observable<Profile> {
    return this.http.patch<Profile>(`${this.api}/${id}/`, data);
  }
}
