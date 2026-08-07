import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

export interface ClcIaResponse { sessaoId:string; resposta:string; intencao:string; sugestoes:string[]; respondidoEm:string; }
@Injectable({providedIn:'root'})
export class ClcIaService {
  private readonly base=`${environment.apiUrl}/clc-ia`;
  constructor(private http:HttpClient){}
  conversar(mensagem:string,sessaoId:string|null):Observable<ClcIaResponse>{return this.http.post<ClcIaResponse>(`${this.base}/chat`,{mensagem,sessaoId});}
}
