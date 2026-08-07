import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { DashboardResumo, DashboardService } from '../core/dashboard.service';
import { EventService, Evento } from '../core/event.service';
import { RegistrationService, Inscricao } from '../core/registration.service';
import { TicketService, BilheteResponse } from '../core/ticket.service';
import { EvaluationService, Avaliacao } from '../core/evaluation.service';
import { JuryService } from '../core/jury.service';

const EMPTY: DashboardResumo = {
  totalEventos: 0, totalInscricoes: 0, totalCandidatos: 0, totalVotos: 0, totalJurados: 0,
  pagamentosPendentes: 0, pagamentosValidados: 0, pagamentosRejeitados: 0,
  inscricoesPorEvento: [], eventosRecentes: []
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, RouterLink],
  template: `
    <section class="heading">
      <div>
        <span>{{ eyebrow() }}</span>
        <h1>{{ title() }}</h1>
        <p>{{ subtitle() }}</p>
      </div>
      @if (isStaff()) {
        <a routerLink="/app/eventos"><mat-icon>add_circle</mat-icon>Novo evento</a>
      } @else if (isParticipante()) {
        <a routerLink="/app/inscricoes"><mat-icon>how_to_reg</mat-icon>Nova inscrição</a>
      } @else if (isJurado()) {
        <a routerLink="/app/avaliacoes"><mat-icon>rate_review</mat-icon>Avaliar</a>
      }
    </section>

    @if (error()) {
      <div class="notice"><mat-icon>cloud_off</mat-icon><span>{{ error() }}</span><button (click)="load()">Tentar novamente</button></div>
    }

    @if (isStaff()) {
      <section class="stats" [class.loading]="loading()">
        @for (card of staffCards(); track card.label) {
          <article><div class="stat-icon"><mat-icon>{{ card.icon }}</mat-icon></div><div><strong>{{ card.value | number }}</strong><span>{{ card.label }}</span><small>{{ card.note }}</small></div></article>
        }
      </section>
      <section class="grid">
        <article class="panel chart-panel">
          <div class="panel-title"><div><span>Participação</span><h2>Inscrições por evento</h2></div><mat-icon>bar_chart</mat-icon></div>
          @if (series().length) {
            <div class="chart">@for (item of series(); track item.label) {<div class="bar-item"><div class="bar-track"><div class="bar" [style.height.%]="height(item.valor)"><b>{{ item.valor }}</b></div></div><span [title]="item.label">{{ item.label }}</span></div>}</div>
          } @else {<div class="empty"><mat-icon>query_stats</mat-icon><p>Ainda não existem inscrições para apresentar.</p></div>}
        </article>
        <article class="panel payment-panel">
          <div class="panel-title"><div><span>Financeiro</span><h2>Pagamentos</h2></div><mat-icon>payments</mat-icon></div>
          <div class="payment-total"><strong>{{ paymentTotal() | number }}</strong><span>submissões</span></div>
          <div class="progress"><i [style.width.%]="paymentPercent()"></i></div>
          <div class="legend"><div><span class="dot valid"></span><b>Validados</b><strong>{{ data().pagamentosValidados }}</strong></div><div><span class="dot pending"></span><b>Pendentes</b><strong>{{ data().pagamentosPendentes }}</strong></div><div><span class="dot rejected"></span><b>Rejeitados</b><strong>{{ data().pagamentosRejeitados }}</strong></div></div>
        </article>
        <article class="panel recent">
          <div class="panel-title"><div><span>Agenda</span><h2>Eventos recentes</h2></div><a routerLink="/app/eventos">Ver todos</a></div>
          @for (event of data().eventosRecentes; track event.id) {<a class="event-row" [routerLink]="['/app/categorias', event.id]"><div class="event-icon"><mat-icon>{{ event.tipo === 'ONLINE' ? 'videocam' : 'location_on' }}</mat-icon></div><div><strong>{{ event.titulo }}</strong><small>{{ event.dataInicio | date:'dd MMM yyyy, HH:mm' }}</small></div><span class="state" [attr.data-state]="event.estado">{{ event.estado }}</span><mat-icon>chevron_right</mat-icon></a>} @empty {<div class="empty compact"><mat-icon>event_busy</mat-icon><p>Nenhum evento registado.</p></div>}
        </article>
        <article class="panel quick"><div class="panel-title"><div><span>Acesso rápido</span><h2>Operações</h2></div><mat-icon>bolt</mat-icon></div><div class="quick-grid"><a routerLink="/app/eventos"><mat-icon>event_note</mat-icon><span>Eventos</span></a><a routerLink="/app/inscricoes"><mat-icon>how_to_reg</mat-icon><span>Inscrições</span></a><a routerLink="/app/pagamentos"><mat-icon>receipt_long</mat-icon><span>Pagamentos</span></a><a routerLink="/app/resultados"><mat-icon>emoji_events</mat-icon><span>Resultados</span></a></div></article>
      </section>
    } @else if (isParticipante()) {
      <section class="stats participant-stats" [class.loading]="loading()">
        <article><div class="stat-icon"><mat-icon>event_available</mat-icon></div><div><strong>{{ publishedEvents().length }}</strong><span>Eventos disponíveis</span><small>publicados</small></div></article>
        <article><div class="stat-icon"><mat-icon>how_to_reg</mat-icon></div><div><strong>{{ myRegistrations().length }}</strong><span>Minhas inscrições</span><small>registadas</small></div></article>
        <article><div class="stat-icon"><mat-icon>check_circle</mat-icon></div><div><strong>{{ approvedRegistrations() }}</strong><span>Inscrições aprovadas</span><small>confirmadas</small></div></article>
        <article><div class="stat-icon"><mat-icon>confirmation_number</mat-icon></div><div><strong>{{ myTickets().length }}</strong><span>Meus bilhetes</span><small>adquiridos</small></div></article>
      </section>
      <section class="participant-grid">
        <article class="panel">
          <div class="panel-title"><div><span>Próximas oportunidades</span><h2>Eventos disponíveis</h2></div><a routerLink="/eventos">Ver todos</a></div>
          @for (event of publishedEvents().slice(0, 5); track event.id) {
            <div class="simple-row"><div class="event-icon"><mat-icon>{{ event.tipo === 'ONLINE' ? 'videocam' : 'location_on' }}</mat-icon></div><div><strong>{{ event.titulo }}</strong><small>{{ event.dataInicio | date:'dd/MM/yyyy HH:mm' }} · {{ event.local }}</small></div><a routerLink="/app/inscricoes">Inscrever</a></div>
          } @empty {<div class="empty compact"><mat-icon>event_busy</mat-icon><p>Não existem eventos publicados neste momento.</p></div>}
        </article>
        <article class="panel">
          <div class="panel-title"><div><span>Minha participação</span><h2>Inscrições recentes</h2></div><a routerLink="/app/inscricoes">Gerir</a></div>
          @for (item of myRegistrations().slice(0, 5); track item.id) {<div class="simple-row"><div class="event-icon"><mat-icon>how_to_reg</mat-icon></div><div><strong>{{ item.eventoTitulo }}</strong><small>{{ item.categoriaNome }}</small></div><span class="state" [attr.data-state]="item.estado">{{ item.estado }}</span></div>} @empty {<div class="empty compact"><mat-icon>person_add</mat-icon><p>Ainda não realizou nenhuma inscrição.</p></div>}
        </article>
        <article class="panel quick participant-quick"><div class="panel-title"><div><span>Acesso rápido</span><h2>O que pretende fazer?</h2></div><mat-icon>bolt</mat-icon></div><div class="quick-grid"><a routerLink="/app/inscricoes"><mat-icon>how_to_reg</mat-icon><span>Inscrever-me</span></a><a routerLink="/app/bilhetes"><mat-icon>confirmation_number</mat-icon><span>Comprar bilhete</span></a><a routerLink="/app/pagamentos"><mat-icon>payments</mat-icon><span>Pagamentos</span></a><a routerLink="/app/perfil"><mat-icon>account_circle</mat-icon><span>Meu perfil</span></a></div></article>
      </section>
    } @else if (isJurado()) {
      <section class="stats participant-stats" [class.loading]="loading()"><article><div class="stat-icon"><mat-icon>event_available</mat-icon></div><div><strong>{{ publishedEvents().length }}</strong><span>Eventos atribuídos</span><small>disponíveis</small></div></article><article><div class="stat-icon"><mat-icon>rate_review</mat-icon></div><div><strong>{{ myEvaluations().length }}</strong><span>Minhas avaliações</span><small>submetidas</small></div></article></section>
      <section class="participant-grid"><article class="panel quick participant-quick"><div class="panel-title"><div><span>Área do jurado</span><h2>Operações</h2></div><mat-icon>gavel</mat-icon></div><div class="quick-grid"><a routerLink="/app/avaliacoes"><mat-icon>rate_review</mat-icon><span>Avaliar candidatos</span></a><a routerLink="/app/perfil"><mat-icon>account_circle</mat-icon><span>Meu perfil</span></a></div></article></section>
    }
  `,
  styles: [`
    .heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}.heading span,.panel-title span{color:#6d28d9;text-transform:uppercase;letter-spacing:.13em;font-size:.68rem;font-weight:900}.heading h1{margin:5px 0;color:#11164b}.heading p{margin:0;color:#777c94}.heading>a{display:flex;align-items:center;gap:8px;text-decoration:none;padding:12px 17px;border-radius:11px;background:linear-gradient(90deg,#6d28d9,#7c3aed);color:#fff;font-weight:800}.notice{display:flex;align-items:center;gap:10px;padding:13px 15px;margin-bottom:16px;border-radius:12px;background:#fff1f0;color:#a8271a}.notice span{flex:1}.notice button{border:0;background:#fff;padding:8px 11px;border-radius:8px;color:#a8271a;font-weight:800}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.participant-stats{grid-template-columns:repeat(4,minmax(0,1fr))}.stats article,.panel{background:#fff;border-radius:16px;box-shadow:0 9px 30px #1419460d}.stats article{display:flex;align-items:center;gap:13px;padding:18px}.stats.loading{opacity:.55}.stat-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#efe8ff;color:#6d28d9}.stats article>div:last-child{display:flex;flex-direction:column;min-width:0}.stats strong{font-size:1.35rem;color:#11164b}.stats span{font-size:.79rem;font-weight:800;color:#333858}.stats small{color:#9a9eb0;margin-top:2px}.grid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:18px;margin-top:18px}.participant-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.participant-quick{grid-column:1/-1}.panel{padding:20px}.panel-title{display:flex;align-items:center;justify-content:space-between}.panel-title h2{margin:4px 0 0;color:#171b4d;font-size:1rem}.panel-title>mat-icon{color:#6d28d9}.panel-title a{font-size:.75rem;text-decoration:none;color:#6d28d9;font-weight:800}.chart{height:260px;display:flex;align-items:stretch;gap:13px;margin-top:18px;padding-top:25px;border-bottom:1px solid #e9ebf2}.bar-item{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}.bar-track{height:210px;width:100%;display:flex;align-items:end;justify-content:center}.bar{position:relative;width:min(55px,75%);min-height:5%;border-radius:9px 9px 0 0;background:linear-gradient(180deg,#7c3aed,#4f46e5)}.bar b{position:absolute;top:-24px;left:50%;transform:translateX(-50%);font-size:.72rem;color:#4c5270}.bar-item>span{width:100%;padding-top:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;color:#7d8299;font-size:.66rem}.payment-total{display:flex;align-items:baseline;gap:7px;margin:30px 0 12px}.payment-total strong{font-size:2.5rem;color:#11164b}.payment-total span{color:#8c90a6}.progress{height:10px;background:#fff1cb;border-radius:20px;overflow:hidden}.progress i{display:block;height:100%;background:#22a06b}.legend{display:grid;gap:13px;margin-top:24px}.legend>div{display:grid;grid-template-columns:12px 1fr auto;align-items:center;gap:9px}.dot{width:10px;height:10px;border-radius:50%}.valid{background:#22a06b}.pending{background:#e5a50a}.rejected{background:#d64545}.event-row,.simple-row{display:grid;grid-template-columns:42px 1fr auto 24px;align-items:center;gap:11px;padding:13px 0;border-top:1px solid #eff0f5;text-decoration:none;color:inherit}.simple-row{grid-template-columns:42px 1fr auto}.simple-row>div:nth-child(2){display:flex;flex-direction:column;min-width:0}.simple-row strong{color:#272c56;font-size:.82rem}.simple-row small{color:#979bad;margin-top:3px}.simple-row>a{color:#6d28d9;text-decoration:none;font-weight:800;font-size:.75rem}.event-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:#f0eaff;color:#6d28d9}.state{padding:5px 8px;border-radius:7px;font-size:.6rem;font-weight:900;background:#eef0f5;color:#596078}.state[data-state=PUBLICADO],.state[data-state=APROVADA]{background:#dcfce7;color:#15803d}.state[data-state=PENDENTE]{background:#fff1cb;color:#9a5b00}.state[data-state=REJEITADA]{background:#fee2e2;color:#b91c1c}.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:20px}.quick-grid a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:84px;border:1px solid #e9eaf2;border-radius:13px;text-decoration:none;color:#4e5472;font-weight:800;font-size:.75rem}.quick-grid a:hover{border-color:#6d28d9;background:#faf8ff;color:#6d28d9}.quick-grid mat-icon{color:#6d28d9}.empty{min-height:220px;display:grid;place-items:center;align-content:center;color:#8b90a7}.empty.compact{min-height:150px}.empty mat-icon{font-size:44px;width:44px;height:44px;color:#b0a2df}@media(max-width:1100px){.stats,.participant-stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:850px){.grid,.participant-grid{grid-template-columns:1fr}.participant-quick{grid-column:auto}.quick-grid{grid-template-columns:1fr 1fr}}@media(max-width:580px){.heading>a{font-size:0}.stats,.participant-stats{grid-template-columns:1fr}.chart{overflow-x:auto}.bar-item{min-width:70px}}
  `]
})
export class DashboardComponent implements OnInit {
  readonly data = signal<DashboardResumo>(EMPTY);
  readonly publishedEvents = signal<Evento[]>([]);
  readonly myRegistrations = signal<Inscricao[]>([]);
  readonly myTickets = signal<BilheteResponse[]>([]);
  readonly myEvaluations = signal<Avaliacao[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly normalizedRole = computed(() => (this.auth.user()?.role ?? '').replace('ROLE_', ''));
  readonly isStaff = computed(() => ['STAFF', 'ADMIN'].includes(this.normalizedRole()));
  readonly isParticipante = computed(() => ['VISITANTE','PARTICIPANTE'].includes(this.normalizedRole()));
  readonly isJurado = computed(() => this.normalizedRole() === 'JURADO');
  readonly eyebrow = computed(() => this.isStaff() ? 'Visão institucional' : this.isJurado() ? 'Área do jurado' : 'Minha área');
  readonly title = computed(() => this.isStaff() ? 'Dashboard' : this.isJurado() ? 'Painel de avaliações' : 'Bem-vindo ao CLC Home');
  readonly subtitle = computed(() => this.isStaff() ? 'Indicadores actualizados directamente da base de dados.' : this.isJurado() ? 'Acompanhe apenas as actividades relacionadas com a sua função.' : 'Consulte eventos, inscrições e bilhetes num só lugar.');
  readonly staffCards = computed(() => [
    { icon: 'event_available', value: this.data().totalEventos, label: 'Eventos', note: 'registados' },
    { icon: 'how_to_reg', value: this.data().totalInscricoes, label: 'Inscrições', note: 'recebidas' },
    { icon: 'groups', value: this.data().totalCandidatos, label: 'Candidatos', note: 'concorrentes' },
    { icon: 'how_to_vote', value: this.data().totalVotos, label: 'Votos', note: 'submetidos' },
    { icon: 'gavel', value: this.data().totalJurados, label: 'Jurados', note: 'atribuídos' }
  ]);
  readonly series = computed(() => this.data().inscricoesPorEvento.slice(0, 8));
  readonly paymentTotal = computed(() => this.data().pagamentosPendentes + this.data().pagamentosValidados + this.data().pagamentosRejeitados);
  readonly approvedRegistrations = computed(() => this.myRegistrations().filter(x => x.estado === 'APROVADA').length);

  constructor(private readonly auth: AuthService, private readonly dashboard: DashboardService, private readonly events: EventService, private readonly registrations: RegistrationService, private readonly tickets: TicketService, private readonly evaluations: EvaluationService, private readonly juries: JuryService) {}

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set('');
    if (this.isStaff()) {
      this.dashboard.resumo().pipe(finalize(() => this.loading.set(false))).subscribe({next:v=>this.data.set(v),error:e=>this.error.set(e.error?.message || e.message || 'Não foi possível carregar o dashboard.')});
      return;
    }
    if (this.isParticipante()) {
      this.dashboard.participante().pipe(
        catchError(primaryError => {
          // Compatibilidade: caso o backend antigo ainda esteja em execução, consulta
          // directamente os três endpoints reais, sem deixar uma falha apagar os restantes dados.
          return forkJoin({
            eventosDisponiveis: this.events.publicados().pipe(catchError(() => of([] as Evento[]))),
            inscricoes: this.registrations.minhas().pipe(catchError(() => of([] as Inscricao[]))),
            bilhetes: this.tickets.meus().pipe(catchError(() => of([] as BilheteResponse[])))
          }).pipe(
            map(r => ({
              totalEventosDisponiveis: r.eventosDisponiveis.length,
              totalInscricoes: r.inscricoes.length,
              totalInscricoesAprovadas: r.inscricoes.filter(x => x.estado === 'APROVADA').length,
              totalBilhetes: r.bilhetes.length,
              ...r
            })),
            catchError(() => { throw primaryError; })
          );
        }),
        finalize(()=>this.loading.set(false))
      ).subscribe({
        next:r=>{
          this.publishedEvents.set(r.eventosDisponiveis ?? []);
          this.myRegistrations.set(r.inscricoes ?? []);
          this.myTickets.set(r.bilhetes ?? []);
          if ((r.eventosDisponiveis?.length ?? 0) === 0 && (r.inscricoes?.length ?? 0) === 0 && (r.bilhetes?.length ?? 0) === 0) {
            this.error.set('A base de dados respondeu sem eventos publicados, inscrições ou bilhetes para esta conta. Confirme que entrou com o mesmo email usado na inscrição e que existe pelo menos um evento no estado PUBLICADO.');
          }
        },
        error:e=>this.error.set(e?.error?.message || e?.message || 'Não foi possível carregar os dados reais do participante.')
      });
      return;
    }
    if (this.isJurado()) {
      forkJoin({events:this.juries.meusEventos(), evaluations:this.evaluations.minhas()}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>{this.publishedEvents.set(r.events);this.myEvaluations.set(r.evaluations);},error:e=>this.error.set(e.error?.message || e.message || 'Não foi possível carregar a área do jurado.')});
      return;
    }
    this.loading.set(false);
  }
  height(value:number):number{const max=Math.max(...this.series().map(x=>x.valor),1);return Math.max(5,Math.round(value/max*100));}
  paymentPercent():number{const total=this.paymentTotal();return total?this.data().pagamentosValidados/total*100:0;}
}
