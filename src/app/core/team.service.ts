import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export type FuncaoEquipa='MC'|'ORGANIZADOR'|'TECNICO';
export interface EquipaEventoRequest{staffId:string;eventoId:string;funcao:FuncaoEquipa}
export interface EquipaEventoResponse{id:string;eventoId:string;staffId:string;eventoTitulo:string;staffNome:string;funcao:FuncaoEquipa}
export interface MembroEquipaDisponivel{id:string;nome:string;email:string;role:'STAFF'|'ADMIN'}

@Injectable({providedIn:'root'})
export class TeamService{
  private readonly base=`${environment.apiUrl}/equipa-evento`;
  constructor(private http:HttpClient){}
  listarMembrosDisponiveis():Observable<MembroEquipaDisponivel[]>{return this.http.get<MembroEquipaDisponivel[]>(`${this.base}/membros-disponiveis`)}
  adicionar(payload:EquipaEventoRequest):Observable<EquipaEventoResponse>{return this.http.post<EquipaEventoResponse>(this.base,payload)}
  listarPorEvento(eventoId:string):Observable<EquipaEventoResponse[]>{return this.http.get<EquipaEventoResponse[]>(`${this.base}/evento/${eventoId}`)}
  remover(id:string):Observable<void>{return this.http.delete<void>(`${this.base}/${id}`)}
}
