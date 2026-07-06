import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Skill } from '../models/profile';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/skills`;

  list(): Observable<Skill[]> {
    return this.http.get<{ results: Skill[] }>(`${this.api}/`).pipe(map(res => res.results));
  }
}
