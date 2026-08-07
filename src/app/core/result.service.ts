import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Resultado {
  id: string;
  eventoId: string;
  candidatoId: string;
  categoriaId: string;
  candidatoNome: string;
  eventoTitulo: string;
  categoriaNome: string;
  posicao: number;
  pontuacaoFinal: number;
  totalVotos: number;
  publicadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(private http: HttpClient) {}

  // CORRIGIDO: POST sem body (o backend não espera body neste endpoint)
  publicar(eventoId: string) {
    return this.http.post<Resultado[]>(
      `${environment.apiUrl}/resultados/evento/${eventoId}`,
      null
    );
  }

  porEvento(eventoId: string) {
    return this.http.get<Resultado[]>(`${environment.apiUrl}/resultados/evento/${eventoId}`);
  }

  porCategoria(categoriaId: string) {
    return this.http.get<Resultado[]>(`${environment.apiUrl}/resultados/categoria/${categoriaId}`);
  }
}