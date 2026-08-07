import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface AuditLog {
  id: string;
  utilizadorNome: string;
  utilizadorEmail?: string;
  accao: string;
  recurso: string;
  detalhes?: string;
  data: string;
}

@Injectable({providedIn:'root'})
export class AuditService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${environment.apiUrl}/admin/auditoria`);
  }
}