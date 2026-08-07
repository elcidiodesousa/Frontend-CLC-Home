import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id?: string; nome: string; email: string; telefone?: string; dataNascimento?: string;
  endereco?: string; provincia?: string; role: string; cargo?: string; fotoUrl?: string;
  miniBiografia?: string; biografia?: string; departamento?: string; formacao?: string;
  especializacao?: string; competencias?: string; linkedinUrl?: string; facebookUrl?: string;
  instagramUrl?: string; websiteUrl?: string; dataEntrada?: string;
}
export interface PasswordChangeRequest { passwordActual:string;novaPassword:string;confirmarPassword:string }
export interface MessageResponse { mensagem:string }
@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  me(): Observable<UserProfile> { return this.http.get<UserProfile>(`${environment.apiUrl}/utilizadores/me`); }
  localProfile(): UserProfile | null { const user=this.auth.user(); return user?{email:user.email,role:user.role,nome:user.email.split('@')[0]}:null; }
  update(payload: Partial<UserProfile>): Observable<UserProfile> { return this.http.put<UserProfile>(`${environment.apiUrl}/utilizadores/me`, payload); }
  uploadPhoto(file:File):Observable<UserProfile>{const f=new FormData();f.append('ficheiro',file);return this.http.post<UserProfile>(`${environment.apiUrl}/utilizadores/me/foto`,f)}
  changePassword(payload: PasswordChangeRequest): Observable<MessageResponse> { return this.http.patch<MessageResponse>(`${environment.apiUrl}/utilizadores/me/password`, payload); }
}
