import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type UserRole = 'VISITANTE' | 'PARTICIPANTE' | 'JURADO' | 'STAFF' | 'ADMIN';

export interface LoginRequest { email: string; password: string; }
export interface RegistoRequest {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: string;
  provincia?: string;
}
export interface AuthResponse { token: string; email: string; role: UserRole; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'clc_auth';
  private readonly state = signal<AuthResponse | null>(this.read());

  readonly user = computed(() => this.state());
  readonly logged = computed(() => Boolean(this.state()?.token));
  readonly isStaff = computed(() => ['STAFF', 'ADMIN'].includes(this.state()?.role ?? ''));
  readonly isAdmin = computed(() => this.state()?.role === 'ADMIN');
  readonly isJurado = computed(() => this.state()?.role === 'JURADO');
  readonly isParticipante = computed(() => ['VISITANTE', 'PARTICIPANTE', 'STAFF', 'ADMIN'].includes(this.state()?.role ?? ''));

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(tap(response => this.save(response)));
  }

  register(request: RegistoRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/registar`, request).pipe(tap(response => this.save(response)));
  }

  registar(request: RegistoRequest): Observable<AuthResponse> { return this.register(request); }
  token(): string | null { return this.state()?.token ?? null; }

  logout(): void {
    localStorage.removeItem(this.key);
    this.state.set(null);
    void this.router.navigate(['/entrar']);
  }

  private save(response: AuthResponse): void {
    localStorage.setItem(this.key, JSON.stringify(response));
    this.state.set(response);
    const returnUrl = localStorage.getItem('clc_return_url');
    if (returnUrl) {
      localStorage.removeItem('clc_return_url');
      void this.router.navigateByUrl(returnUrl);
      return;
    }
    void this.router.navigate(['/app/dashboard']);
  }

  private read(): AuthResponse | null {
    try { return JSON.parse(localStorage.getItem(this.key) ?? 'null') as AuthResponse | null; }
    catch { return null; }
  }
}
