import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, timer} from 'rxjs';
import {switchMap, take, takeWhile} from 'rxjs/operators';
import {environment} from '../../environments/environment';

export type TipoPagamentoGateway='INSCRICAO'|'BILHETE';
export type EstadoPagamentoGateway='PENDENTE'|'PROCESSANDO'|'PAGO'|'FALHOU'|'EXPIRADO'|'CANCELADO'|'REEMBOLSADO';

export interface GatewayPagamento{
  pagamentoId:string;
  referencia:string;
  tipoPagamento:TipoPagamentoGateway;
  valor:number;
  estado:EstadoPagamentoGateway;
  provider:string;
  providerPaymentId?:string;
  checkoutUrl?:string;
  transactionId?:string;
  metodoCarteira?:string;
  numeroCarteiraMascarado?:string;
  criadoEm:string;
  pagoEm?:string;
  mensagem?:string;
}

@Injectable({providedIn:'root'})
export class GatewayPaymentService{
  private readonly base=`${environment.apiUrl}/pagamentos/gateway`;

  constructor(private readonly http:HttpClient){}

  iniciar(tipoPagamento:TipoPagamentoGateway,origemId:string,metodo:'mpesa'|'emola',numeroCarteira:string):Observable<GatewayPagamento>{
    return this.http.post<GatewayPagamento>(`${this.base}/iniciar`,{tipoPagamento,origemId,metodo,numeroCarteira});
  }

  meus():Observable<GatewayPagamento[]>{
    return this.http.get<GatewayPagamento[]>(`${this.base}/meus`);
  }

  consultar(referencia:string):Observable<GatewayPagamento>{
    return this.http.get<GatewayPagamento>(`${this.base}/${encodeURIComponent(referencia)}`);
  }

  sincronizar(referencia:string):Observable<GatewayPagamento>{
    return this.http.post<GatewayPagamento>(`${this.base}/${encodeURIComponent(referencia)}/sincronizar`,{});
  }

  /**
   * Polling recomendado pela VPay: consulta o backend a cada 3 segundos.
   * O access token VPay permanece apenas no backend.
   */
  acompanhar(referencia:string,intervaloMs=3000,maxTentativas=40):Observable<GatewayPagamento>{
    return timer(0,intervaloMs).pipe(
      take(maxTentativas),
      switchMap(()=>this.sincronizar(referencia)),
      takeWhile(p=>!this.finalizado(p.estado),true)
    );
  }

  abrirCheckout(p:GatewayPagamento):boolean{
    if(!p.checkoutUrl) return false;
    window.location.assign(p.checkoutUrl);
    return true;
  }

  finalizado(estado:EstadoPagamentoGateway):boolean{
    return ['PAGO','FALHOU','EXPIRADO','CANCELADO','REEMBOLSADO'].includes(estado);
  }
}
