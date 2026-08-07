import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

export interface BilheteResponse {
  id:string;
  eventoId:string;
  eventoTitulo:string;
  eventoLocal:string;
  eventoDataInicio:string;
  compradorNome:string;
  codigoQr:string;
  estado:'AGUARDANDO_PAGAMENTO'|'VALIDO'|'USADO'|'EXPIRADO'|'CANCELADO';
  preco:number;
  dataCompra:string;
  validadoEm?:string|null;
  validadoPorNome?:string|null;
}

@Injectable({providedIn:'root'})
export class TicketService {
  private base=`${environment.apiUrl}/bilhetes`;
  constructor(private http:HttpClient){}
  comprar(eventoId:string){return this.http.post<BilheteResponse>(this.base,{eventoId})}
  meus(){return this.http.get<BilheteResponse[]>(`${this.base}/meus`)}
  listarPorEvento(id:string){return this.http.get<BilheteResponse[]>(`${this.base}/evento/${id}`)}
  buscarPorQr(qr:string){return this.http.get<BilheteResponse>(`${this.base}/qr/${encodeURIComponent(qr)}`)}
  validar(qr:string){return this.http.patch<BilheteResponse>(`${this.base}/validar/${encodeURIComponent(qr)}`,null)}
  qrPng(id:string){return this.http.get(`${this.base}/${id}/qr.png`,{responseType:'blob'})}
  pdf(id:string){return this.http.get(`${this.base}/${id}/pdf`,{responseType:'blob'})}
}
