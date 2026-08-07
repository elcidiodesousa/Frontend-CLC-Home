import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

export type EstadoAvaliacao='RASCUNHO'|'SUBMETIDA';
export interface Avaliacao{
  id:string;candidatoId:string;criterioId:string;candidatoNome:string;criterioNome:string;
  nota:number;comentario?:string|null;estado:EstadoAvaliacao;dataAvaliacao:string;
  actualizadoEm:string;juradoNome:string
}
export interface AvaliacaoRequest{
  candidatoId:string;criterioId:string;nota:number;comentario?:string|null;estado?:EstadoAvaliacao
}
export interface ProgressoAvaliacao{
  eventoId:string;totalCandidatos:number;totalCriterios:number;avaliacoesEsperadas:number;
  avaliacoesSubmetidas:number;rascunhos:number;percentagemConcluida:number
}
export interface RankingPrevia{
  posicao:number;candidatoId:string;candidatoNome:string;categoriaId:string;
  categoriaNome:string;notaFinal:number;criteriosSubmetidos:number
}

@Injectable({providedIn:'root'})
export class EvaluationService{
  constructor(private http:HttpClient){}
  avaliar(body:AvaliacaoRequest){return this.http.post<Avaliacao>(environment.apiUrl+'/avaliacoes',body)}
  porCandidato(candidatoId:string){return this.http.get<Avaliacao[]>(environment.apiUrl+'/avaliacoes/candidato/'+candidatoId)}
  minhas(){return this.http.get<Avaliacao[]>(environment.apiUrl+'/avaliacoes/minhas')}
  submeterCandidato(candidatoId:string){return this.http.post<Avaliacao[]>(`${environment.apiUrl}/avaliacoes/candidato/${candidatoId}/submeter`,null)}
  progresso(eventoId:string){return this.http.get<ProgressoAvaliacao>(`${environment.apiUrl}/avaliacoes/evento/${eventoId}/progresso`)}
  rankingPrevia(eventoId:string){return this.http.get<RankingPrevia[]>(`${environment.apiUrl}/avaliacoes/evento/${eventoId}/ranking-previa`)}
  relatorioCsvUrl(eventoId:string){return `${environment.apiUrl}/avaliacoes/evento/${eventoId}/relatorio.csv`}
}
