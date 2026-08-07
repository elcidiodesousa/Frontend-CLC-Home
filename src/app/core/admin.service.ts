import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserRole = 'VISITANTE' | 'PARTICIPANTE' | 'JURADO' | 'STAFF' | 'ADMIN';
export type Cargo = 'PRESIDENTE' | 'VICE_PRESIDENTE' | 'COORDENADOR' | 'TESOUREIRO' | 'ORGANIZADOR';

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  provincia?: string;
  role: UserRole;
  criadoEm?: string;
}

export interface InternalUserCreatePayload {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  provincia?: string;
  role: 'ADMIN' | 'STAFF' | 'JURADO';
  cargo?: Cargo | null;
}

export interface InternalUserCreateResponse {
  utilizador: AdminUser;
  cargo?: StaffCargoResponse | null;
}

export interface StaffCargoResponse {
  id: string;
  staffId: string;
  staffNome: string;
  cargo: Cargo;
  eventoId?: string | null;
  eventoTitulo?: string | null;
}

export interface AdminSummary {
  utilizadores: number;
  participantes: number;
  jurados: number;
  staff: number;
  administradores: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) {}

  listUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.base}/utilizadores`);
  }

  createInternalUser(payload: InternalUserCreatePayload): Observable<InternalUserCreateResponse> {
    return this.http.post<InternalUserCreateResponse>(`${this.base}/utilizadores/internos`, payload);
  }

  updateRole(userId: string, role: UserRole): Observable<AdminUser> {
    return this.http.patch<AdminUser>(
      `${this.base}/utilizadores/${userId}/role`,
      JSON.stringify(role),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  listStaffCargos(): Observable<StaffCargoResponse[]> {
    return this.http.get<StaffCargoResponse[]>(`${this.base}/cargos`);
  }

  assignCargo(payload: { staffId: string; cargo: Cargo; eventoId?: string | null }): Observable<StaffCargoResponse> {
    return this.http.post<StaffCargoResponse>(`${this.base}/cargos`, payload);
  }

  removeCargo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/cargos/${id}`);
  }

  summary(): Observable<AdminSummary> {
    return this.http.get<AdminSummary>(`${this.base}/resumo`);
  }
}