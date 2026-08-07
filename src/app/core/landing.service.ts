import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Evento} from './event.service';

export interface Institucional{ id?:number;nomeOrganizacao:string;slogan?:string;sobreNos?:string;quemSomos?:string;ondePretendemosChegar?:string;missao?:string;visao?:string;valores?:string;numeroMembros:number;email?:string;telefone?:string;endereco?:string;facebookUrl?:string;instagramUrl?:string;youtubeUrl?:string }
export interface Membro{ id:string;nome:string;cargo:string;departamento?:string;miniBiografia?:string;biografia?:string;fotoUrl?:string;formacao?:string;especializacao?:string;competencias?:string;linkedinUrl?:string;facebookUrl?:string;instagramUrl?:string;websiteUrl?:string;destaque:boolean;ordem:number }
export interface EquipaAdmin{ id:string;nome:string;email:string;role:string;cargo:string;departamento?:string;biografia?:string;fotoUrl?:string;mostrarLanding:boolean;destaqueLanding:boolean;ordemLanding:number }
export interface EventoMedia{id:string;eventoId:string;tipo:'FOTO'|'VIDEO';mediaUrl:string;legenda?:string;destaque:boolean;ordemExibicao:number}
export interface EventoLanding{evento:Evento;galeria:EventoMedia[]}
export interface LandingData{institucional:Institucional;eventosActuais:EventoLanding[];historico:EventoLanding[];membros:Membro[]}
@Injectable({providedIn:'root'})
export class LandingService{
  private base=`${environment.apiUrl}/landing`;
  constructor(private http:HttpClient){}
  carregar(){return this.http.get<LandingData>(this.base)}
  institucional(){return this.http.get<Institucional>(`${this.base}/institucional`)}
  guardarInstitucional(x:Institucional){return this.http.put<Institucional>(`${this.base}/institucional`,x)}
  equipaAdmin(){return this.http.get<EquipaAdmin[]>(`${this.base}/equipa/admin`)}
  actualizarEquipa(id:string,x:Partial<EquipaAdmin>){return this.http.patch<EquipaAdmin>(`${this.base}/equipa/${id}`,x)}
  medias(eventoId:string){return this.http.get<EventoMedia[]>(`${this.base}/eventos/${eventoId}/medias`)}
  adicionarMedia(eventoId:string,file:File,legenda:string,destaque:boolean,ordem:number){const f=new FormData();f.append('ficheiro',file);f.append('legenda',legenda||'');f.append('destaque',String(destaque));f.append('ordem',String(ordem));return this.http.post<EventoMedia>(`${this.base}/eventos/${eventoId}/medias`,f)}
  eliminarMedia(id:string){return this.http.delete<void>(`${this.base}/medias/${id}`)}
}
