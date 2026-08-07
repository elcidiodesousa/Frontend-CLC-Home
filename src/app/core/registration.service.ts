import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type EstadoInscricao = 'AGUARDANDO_PAGAMENTO' | 'APROVADA' | 'EXPIRADA' | 'CANCELADA' | 'REJEITADA' | 'PENDENTE' | 'EM_ESPERA';

export interface Inscricao {
  id: string;
  eventoId: string;
  categoriaId: string;
  eventoTitulo: string;
  categoriaNome: string;
  participanteId: string;
  participanteNome: string;
  estado: EstadoInscricao;
  dataInscricao: string;
  reservaExpiraEm?: string;
  pagamentoNecessario: boolean;
  valorPagamento: number;
}

export interface InscricaoRequest {
  eventoId: string;
  categoriaId: string;
}

const JSON_HEADERS = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  constructor(private http: HttpClient) {}

  inscrever(body: InscricaoRequest) {
    return this.http.post<Inscricao>(`${environment.apiUrl}/inscricoes`, body);
  }

  porEvento(eventoId: string) {
    return this.http.get<Inscricao[]>(`${environment.apiUrl}/inscricoes/evento/${eventoId}`);
  }

  minhas() {
    return this.http.get<Inscricao[]>(`${environment.apiUrl}/inscricoes/minhas`);
  }

  // CORRIGIDO: envia enum como string JSON pura com Content-Type correcto
  alterarEstado(id: string, estado: EstadoInscricao) {
    return this.http.patch<Inscricao>(
      `${environment.apiUrl}/inscricoes/${id}/estado`,
      JSON.stringify(estado),
      JSON_HEADERS
    );
  }

  cancelar(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/inscricoes/${id}`);
  }
}