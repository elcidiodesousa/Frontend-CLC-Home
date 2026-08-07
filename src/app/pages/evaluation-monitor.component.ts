import {CommonModule} from '@angular/common';
import {Component, OnInit, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {EventService, EventoResponse} from '../core/event.service';
import {EvaluationService, ProgressoAvaliacao, RankingPrevia} from '../core/evaluation.service';

@Component({
  standalone:true,
  imports:[CommonModule,MatIconModule],
  template:`
  <section class="heading">
    <div><span>Avaliações e resultados</span><h1>Monitor de avaliação</h1><p>Acompanhe o progresso dos jurados e consulte a classificação provisória.</p></div>
    <button class="export" [disabled]="!eventoId()" (click)="exportar()"><mat-icon>download</mat-icon>Exportar CSV</button>
  </section>

  <section class="selector">
    <label>Evento
      <select [value]="eventoId()" (change)="seleccionar($any($event.target).value)">
        <option value="">Seleccione um evento</option>
        <option *ngFor="let evento of eventos()" [value]="evento.id">{{evento.titulo}}</option>
      </select>
    </label>
  </section>

  <p class="notice error" *ngIf="erro()">{{erro()}}</p>
  <p class="notice" *ngIf="carregando()">A carregar dados de avaliação...</p>

  <ng-container *ngIf="progresso() as p">
    <section class="cards">
      <article><mat-icon>groups</mat-icon><small>Candidatos</small><strong>{{p.totalCandidatos}}</strong></article>
      <article><mat-icon>fact_check</mat-icon><small>Critérios</small><strong>{{p.totalCriterios}}</strong></article>
      <article><mat-icon>task_alt</mat-icon><small>Submetidas</small><strong>{{p.avaliacoesSubmetidas}} / {{p.avaliacoesEsperadas}}</strong></article>
      <article><mat-icon>edit_note</mat-icon><small>Rascunhos</small><strong>{{p.rascunhos}}</strong></article>
    </section>

    <section class="progress-card">
      <div><span>Progresso global</span><strong>{{p.percentagemConcluida | number:'1.0-1'}}%</strong></div>
      <div class="track"><i [style.width.%]="p.percentagemConcluida"></i></div>
      <p>O ranking considera apenas avaliações submetidas. Rascunhos não entram no cálculo final.</p>
    </section>
  </ng-container>

  <section class="ranking" *ngIf="ranking().length">
    <div class="table-head"><div><span>Classificação provisória</span><h2>Ranking por média ponderada</h2></div><small>{{ranking().length}} candidatos</small></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Posição</th><th>Candidato</th><th>Categoria</th><th>Critérios submetidos</th><th>Nota final</th></tr></thead>
        <tbody>
          <tr *ngFor="let item of ranking()">
            <td><b class="position" [class.top]="item.posicao<=3">{{item.posicao}}.º</b></td>
            <td><strong>{{item.candidatoNome}}</strong></td>
            <td>{{item.categoriaNome}}</td>
            <td>{{item.criteriosSubmetidos}}</td>
            <td><b class="score">{{item.notaFinal | number:'1.2-2'}}</b></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="empty" *ngIf="!eventoId()"><mat-icon>monitoring</mat-icon><h2>Seleccione um evento</h2><p>Escolha o evento para visualizar o progresso e a classificação provisória.</p></section>
  `,
  styles:[`
    .heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:20px}.heading span,.table-head span{color:var(--primary);text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;font-weight:900}.heading h1{margin:6px 0;color:var(--text);font-size:2rem}.heading p,.progress-card p,.empty p{color:var(--muted)}.export{display:flex;align-items:center;gap:8px;border:0;border-radius:11px;padding:12px 16px;background:var(--primary);color:white;font-weight:800;cursor:pointer}.export:disabled{opacity:.45;cursor:not-allowed}.selector,.progress-card,.ranking,.empty{background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:0 12px 30px rgba(20,25,78,.06)}.selector{padding:18px;margin-bottom:18px}.selector label{display:grid;gap:8px;max-width:520px;font-weight:800;color:var(--text)}select{padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text)}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:18px}.cards article{padding:18px;background:var(--surface);border:1px solid var(--line);border-radius:15px;display:grid;grid-template-columns:42px 1fr;gap:2px 12px;align-items:center}.cards mat-icon{grid-row:1/3;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:rgba(var(--primary-rgb),.12);color:var(--primary)}.cards small{color:var(--muted);font-weight:700}.cards strong{font-size:1.25rem;color:var(--text)}.progress-card{padding:20px;margin-bottom:18px}.progress-card>div:first-child{display:flex;justify-content:space-between;color:var(--text);font-weight:800}.track{height:10px;background:var(--surface-soft);border-radius:999px;overflow:hidden;margin:14px 0}.track i{display:block;height:100%;background:linear-gradient(90deg,var(--primary),var(--primary-2));border-radius:inherit}.ranking{overflow:hidden}.table-head{display:flex;justify-content:space-between;align-items:center;padding:20px}.table-head h2{margin:5px 0 0;color:var(--text)}.table-head small{color:var(--muted)}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:14px 18px;text-align:left;border-top:1px solid var(--line);color:var(--text)}th{font-size:.72rem;text-transform:uppercase;color:var(--muted);background:var(--surface-soft)}.position{display:inline-grid;place-items:center;min-width:40px;padding:7px;border-radius:9px;background:var(--surface-soft)}.position.top{background:rgba(var(--primary-rgb),.13);color:var(--primary)}.score{font-size:1.05rem;color:var(--primary)}.notice{padding:12px 15px;border-radius:10px;background:var(--surface);color:var(--muted);margin-bottom:15px}.notice.error{background:#fff1f0;color:#b42318}.empty{text-align:center;padding:55px 20px}.empty mat-icon{font-size:52px;width:52px;height:52px;color:var(--primary)}@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.heading{align-items:stretch;flex-direction:column}.cards{grid-template-columns:1fr}}
  `]
})
export class EvaluationMonitorComponent implements OnInit{
  eventos=signal<EventoResponse[]>([]);eventoId=signal('');progresso=signal<ProgressoAvaliacao|null>(null);
  ranking=signal<RankingPrevia[]>([]);carregando=signal(false);erro=signal('');
  constructor(private events:EventService,private evaluations:EvaluationService){}
  ngOnInit(){this.events.listar().subscribe({next:v=>this.eventos.set(v),error:()=>this.erro.set('Não foi possível carregar os eventos.')})}
  seleccionar(id:string){this.eventoId.set(id);this.progresso.set(null);this.ranking.set([]);this.erro.set('');if(!id)return;this.carregando.set(true);let restantes=2;const concluir=()=>{restantes--;if(restantes===0)this.carregando.set(false)};this.evaluations.progresso(id).subscribe({next:v=>{this.progresso.set(v);concluir()},error:()=>{this.erro.set('Não foi possível carregar o progresso.');concluir()}});this.evaluations.rankingPrevia(id).subscribe({next:v=>{this.ranking.set(v);concluir()},error:()=>{this.erro.set('Não foi possível carregar o ranking.');concluir()}})}
  exportar(){const id=this.eventoId();if(id)window.open(this.evaluations.relatorioCsvUrl(id),'_blank')}
}
