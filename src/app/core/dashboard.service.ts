import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoEvento, TipoEvento, Evento } from './event.service';
import { Inscricao } from './registration.service';
import { BilheteResponse } from './ticket.service';

export interface DashboardResumo {
  totalEventos: number;
  totalInscricoes: number;
  totalCandidatos: number;
  totalVotos: number;
  totalJurados: number;
  pagamentosPendentes: number;
  pagamentosValidados: number;
  pagamentosRejeitados: number;
  inscricoesPorEvento: DashboardSerie[];
  eventosRecentes: DashboardEventoRecente[];
}

export interface ParticipanteDashboard {
  totalEventosDisponiveis: number;
  totalInscricoes: number;
  totalInscricoesAprovadas: number;
  totalBilhetes: number;
  eventosDisponiveis: Evento[];
  inscricoes: Inscricao[];
  bilhetes: BilheteResponse[];
}

export interface DashboardSerie {
  label: string;
  valor: number;
}

export interface DashboardEventoRecente {
  id: string;
  titulo: string;
  estado: EstadoEvento;
  tipo: TipoEvento;
  dataInicio: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly base = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  resumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${this.base}/resumo`);
  }

  participante(): Observable<ParticipanteDashboard> {
    return this.http.get<ParticipanteDashboard>(`${this.base}/participante`);
  }
}
