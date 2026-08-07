import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type EstadoEvento='DRAFT'|'APROVADO'|'PUBLICADO'|'ENCERRADO';
export type TipoEvento='PRESENCIAL'|'ONLINE';
export type ModoAvaliacao='JURI'|'PUBLICO'|'MISTO';

export interface Evento{
  id:string;
  titulo:string;
  descricao:string;
  slogan?:string;
  cartazUrl?:string;
  tipo:TipoEvento;
  estado:EstadoEvento;
  dataInicio:string;
  dataFim:string;
  dataLimiteInscricao:string;
  limiteParticipantes:number;
  vagasOcupadas:number;
  vagasReservadas:number;
  vagasDisponiveis:number;
  local:string;
  inscricaoPaga:boolean;
  precoInscricao:number;
  prazoReservaMinutos:number;
  precoBilhete?:number;
  quantidadeBilhetes?:number;
  vendaBilhetesAtiva:boolean;
  votacaoPublicaAtiva:boolean;
  modoAvaliacao:ModoAvaliacao;
  inicioVotacao?:string;
  fimVotacao?:string;
  pesoJuri:number;
  pesoPublico:number;
}

export type EventoResponse=Evento;

export interface EventoRequest{
  titulo:string;
  descricao:string;
  slogan?:string;
  tipo:TipoEvento;
  dataInicio:string;
  dataFim:string;
  dataLimiteInscricao:string;
  limiteParticipantes:number;
  local:string;
  inscricaoPaga:boolean;
  precoInscricao:number;
  prazoReservaMinutos:number;
  votacaoPublicaAtiva:boolean;
  modoAvaliacao:ModoAvaliacao;
  inicioVotacao:string;
  fimVotacao:string;
  pesoJuri:number;
  pesoPublico:number;
}

@Injectable({providedIn:'root'})
export class EventService{
  private readonly base=`${environment.apiUrl}/eventos`;

  constructor(private readonly http:HttpClient){}

  publicados():Observable<Evento[]>{return this.http.get<Evento[]>(`${this.base}/publicados`)}
  listPublished():Observable<Evento[]>{return this.publicados()}
  todos():Observable<Evento[]>{return this.http.get<Evento[]>(this.base)}
  listar():Observable<Evento[]>{return this.todos()}
  listarTodos():Observable<Evento[]>{return this.todos()}
  porId(id:string):Observable<Evento>{return this.http.get<Evento>(`${this.base}/${id}`)}
  criar(x:EventoRequest):Observable<Evento>{return this.http.post<Evento>(this.base,x)}
  actualizar(id:string,x:EventoRequest):Observable<Evento>{return this.http.put<Evento>(`${this.base}/${id}`,x)}
  mudarEstado(id:string,e:EstadoEvento):Observable<Evento>{return this.http.patch<Evento>(`${this.base}/${id}/estado`,JSON.stringify(e),{headers:{'Content-Type':'application/json'}})}
  configurarBilheteira(id:string,x:{preco:number;quantidade:number;ativa:boolean}):Observable<Evento>{return this.http.patch<Evento>(`${this.base}/${id}/bilheteira`,x)}
  uploadCartaz(id:string,file:File):Observable<Evento>{const f=new FormData();f.append('ficheiro',file);return this.http.post<Evento>(`${this.base}/${id}/cartaz`,f)}
  eliminar(id:string):Observable<void>{return this.http.delete<void>(`${this.base}/${id}`)}
}
