import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

export interface CriterioAvaliacao {
  id: string;
  eventoId: string;
  nome: string;
  peso: number;
  eventoTitulo: string;
}

export interface CriterioAvaliacaoRequest {
  eventoId: string;
  nome: string;
  peso: number;
}

@Injectable({providedIn: 'root'})
export class CriteriaService {
  constructor(private http: HttpClient) {}

  // CORRIGIDO: /criterios-avaliacao → /criterios (alinhado com CriterioAvaliacaoController)
  porEvento(eventoId: string) {
    return this.http.get<CriterioAvaliacao[]>(`${environment.apiUrl}/criterios/evento/${eventoId}`);
  }

  porId(id: string) {
    return this.http.get<CriterioAvaliacao>(`${environment.apiUrl}/criterios/${id}`);
  }

  criar(body: CriterioAvaliacaoRequest) {
    return this.http.post<CriterioAvaliacao>(`${environment.apiUrl}/criterios`, body);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/criterios/${id}`);
  }
}