import {Component, OnInit, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {AuditLog, AuditService} from '../core/audit.service';

@Component({
  standalone:true,
  imports:[DatePipe,MatIconModule],
  template:`
  <section class="heading"><div><span>Segurança</span><h1>Auditoria do sistema</h1><p>Histórico das acções sensíveis realizadas na plataforma.</p></div></section>
  @if(error()){<div class="callout callout-error" role="alert"><mat-icon>warning</mat-icon>{{error()}}</div>}
  <section class="panel">
    <div class="head"><span>Utilizador</span><span>Acção</span><span>Recurso</span><span>Detalhes</span><span>Data</span></div>
    @if(loading()){<div class="empty">A carregar registos...</div>}
    @else if(logs().length===0){<div class="empty">Ainda não existem registos de auditoria.</div>}
    @else {
      @for(log of logs(); track log.id){
        <div class="row">
          <div><strong>{{log.utilizadorNome}}</strong><small>{{log.utilizadorEmail}}</small></div>
          <span class="action">{{log.accao}}</span><span>{{log.recurso}}</span><span>{{log.detalhes || '—'}}</span><span>{{log.data | date:'dd/MM/yyyy HH:mm'}}</span>
        </div>
      }
    }
  </section>
  `,
  styles:[`
  .heading span{color:var(--primary);text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;font-weight:800}.heading h1{margin:6px 0;color:var(--text)}.heading p{margin:0;color:var(--muted)}.panel{background:var(--surface);border-radius:16px;overflow:hidden;margin-top:22px;box-shadow:0 8px 28px #1419460d}.head,.row{display:grid;grid-template-columns:1.2fr .8fr .8fr 1.5fr .9fr;gap:14px;align-items:center;padding:14px 20px}.head{background:var(--surface-soft);color:var(--muted);text-transform:uppercase;font-size:.68rem;font-weight:800}.row{border-top:1px solid var(--line);color:var(--text);font-size:.78rem}.row>div{display:flex;flex-direction:column}.row strong{color:var(--text)}.row small{color:var(--muted);margin-top:3px}.action{justify-self:start;background:var(--primary-soft);color:var(--primary);padding:6px 9px;border-radius:8px;font-weight:800;font-size:.66rem}.empty{padding:44px;text-align:center;color:var(--muted)}.error{display:flex;gap:8px;background:var(--danger-soft);color:var(--danger-ink);padding:13px;border-radius:11px;margin-top:16px}@media(max-width:850px){.head{display:none}.row{grid-template-columns:1fr auto}.row>span:not(.action){display:none}}
  `]
})
export class AuditComponent implements OnInit {
  readonly logs = signal<AuditLog[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor(private readonly audit: AuditService) {}
  ngOnInit(): void {
    this.audit.list().subscribe({
      next: value => {this.logs.set(value);this.loading.set(false);},
      error: (e:Error) => {this.error.set(`Não foi possível carregar o histórico neste momento. Tente novamente mais tarde.`);this.loading.set(false);}
    });
  }
}
