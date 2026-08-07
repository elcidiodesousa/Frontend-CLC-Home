import {CommonModule} from '@angular/common';
import {Component,OnInit,computed,signal} from '@angular/core';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {forkJoin} from 'rxjs';
import {EventService,Evento} from '../core/event.service';
import {CandidateService,Candidato} from '../core/candidate.service';
import {VoteService} from '../core/vote.service';
import {LogoComponent} from '../shared/logo.component';

@Component({
  standalone:true,
  imports:[CommonModule,RouterLink,MatIconModule,LogoComponent],
  template:`
  <div class="vote-page">
    <header><app-logo/><a routerLink="/eventos"><mat-icon>arrow_back</mat-icon>Eventos</a></header>
    <section class="hero" *ngIf="event() as e">
      <div><span>Votação pública</span><h1>{{e.titulo}}</h1><p>Escolha o seu candidato favorito. Cada utilizador pode votar apenas uma vez neste evento.</p></div>
      <div class="event-meta"><b><mat-icon>schedule</mat-icon>{{(e.inicioVotacao||e.dataInicio)|date:'dd MMM, HH:mm'}} — {{(e.fimVotacao||e.dataFim)|date:'dd MMM, HH:mm'}}</b><b><mat-icon>location_on</mat-icon>{{e.local}}</b></div>
    </section>
    <main>
      <div class="notice" *ngIf="success()"><mat-icon>check_circle</mat-icon><div><strong>Voto registado com sucesso!</strong><span>Obrigado por participar neste evento cultural.</span></div></div>
      <div class="notice error" *ngIf="error()"><mat-icon>error</mat-icon><div><strong>Não foi possível votar</strong><span>{{error()}}</span></div></div>
      <div class="toolbar"><div><span>Candidatos</span><h2>Escolha apenas um participante</h2></div><label><mat-icon>search</mat-icon><input [value]="search()" (input)="search.set($any($event.target).value)" placeholder="Pesquisar candidato"></label></div>
      <div class="loading" *ngIf="loading()">A carregar candidatos...</div>
      <div class="grid" *ngIf="!loading()">
        <article *ngFor="let c of filtered();trackBy:trackCandidate" [class.selected]="selected()?.id===c.id" (click)="select(c)">
          <div class="photo" [style.background-image]="c.fotoUrl?'url('+c.fotoUrl+')':''"><mat-icon *ngIf="!c.fotoUrl">person</mat-icon><span>{{c.categoriaNome}}</span></div>
          <div class="body"><h3>{{c.nome}}</h3><p>{{c.descricao||'Participante do evento CLC Home.'}}</p><button type="button" [disabled]="success()"><mat-icon>{{selected()?.id===c.id?'radio_button_checked':'radio_button_unchecked'}}</mat-icon>{{selected()?.id===c.id?'Seleccionado':'Seleccionar'}}</button></div>
        </article>
      </div>
      <div class="vote-bar" *ngIf="selected() && !success()"><div><small>O seu voto</small><strong>{{selected()?.nome}}</strong></div><button (click)="confirmVote()" [disabled]="submitting()"><mat-icon>how_to_vote</mat-icon>{{submitting()?'A confirmar...':'Confirmar voto'}}</button></div>
    </main>
  </div>`,
  styles:[`
  .vote-page{min-height:100vh;background:#f5f6fb;color:#14194e}header{height:82px;padding:0 6vw;background:#11165b;display:flex;align-items:center;justify-content:space-between}header a{display:flex;align-items:center;gap:7px;color:#fff;text-decoration:none;font-weight:800}.hero{padding:60px 6vw;display:flex;justify-content:space-between;gap:30px;color:#fff;background:linear-gradient(120deg,#11165b,#6d28d9)}.hero span{color:#f6b323;text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;font-weight:800}.hero h1{font-size:clamp(2.3rem,5vw,4rem);margin:10px 0}.hero p{max-width:650px;color:#e1e3f7}.event-meta{display:grid;align-content:center;gap:12px}.event-meta b{display:flex;align-items:center;gap:8px;font-size:.82rem;background:#ffffff12;padding:12px;border-radius:10px}main{padding:38px 6vw 120px}.notice{display:flex;gap:12px;align-items:center;padding:16px;border-radius:14px;margin-bottom:22px;background:#dcfce7;color:#166534}.notice div{display:flex;flex-direction:column}.notice span{font-size:.8rem;margin-top:3px}.notice.error{background:#fee2e2;color:#991b1b}.toolbar{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.toolbar span{color:#6d28d9;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em}.toolbar h2{margin:5px 0}.toolbar label{height:44px;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e1e3ee;border-radius:11px;padding:0 12px}.toolbar input{border:0;outline:0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{background:#fff;border:2px solid transparent;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px #15194712;cursor:pointer;transition:.2s}article:hover{transform:translateY(-3px)}article.selected{border-color:#6d28d9;box-shadow:0 16px 45px #6d28d92b}.photo{height:190px;background:linear-gradient(135deg,#1e3a8a,#6d28d9);background-size:cover;background-position:center;display:flex;align-items:end;justify-content:space-between;padding:16px;color:#fff}.photo>mat-icon{font-size:70px;width:70px;height:70px;color:#ffffffaa}.photo span{background:#11165bdd;padding:7px 10px;border-radius:8px;font-size:.68rem;font-weight:800}.body{padding:18px}.body h3{margin:0}.body p{color:#747991;min-height:42px;font-size:.85rem}.body button{width:100%;height:42px;border:1px solid #dedfed;border-radius:10px;background:#fff;color:#5c617c;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px}.selected .body button{background:#6d28d9;color:#fff;border-color:#6d28d9}.vote-bar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);width:min(760px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;padding:16px 18px;background:#11165b;color:#fff;border-radius:16px;box-shadow:0 20px 50px #11165b55;z-index:5}.vote-bar div{display:flex;flex-direction:column}.vote-bar small{color:#b8bde0}.vote-bar button{display:flex;align-items:center;gap:8px;border:0;border-radius:10px;padding:12px 18px;background:#f6b323;color:#17102c;font-weight:900;cursor:pointer}.loading{text-align:center;padding:50px;background:#fff;border-radius:16px}@media(max-width:950px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.grid{grid-template-columns:1fr}.hero,.toolbar{flex-direction:column;align-items:stretch}.vote-bar{bottom:10px}.event-meta{display:none}}
  `]
})
export class VotingComponent implements OnInit{
  event=signal<Evento|null>(null);candidates=signal<Candidato[]>([]);selected=signal<Candidato|null>(null);loading=signal(true);submitting=signal(false);success=signal(false);error=signal('');search=signal('');
  filtered=computed(()=>{const q=this.search().trim().toLowerCase();return this.candidates().filter(c=>!q||c.nome.toLowerCase().includes(q)||c.categoriaNome.toLowerCase().includes(q))});
  private eventId='';
  constructor(private route:ActivatedRoute,private events:EventService,private candidatesService:CandidateService,private votes:VoteService){}
  ngOnInit(){this.eventId=this.route.snapshot.paramMap.get('eventoId')||'';forkJoin({event:this.events.porId(this.eventId),candidates:this.candidatesService.porEvento(this.eventId)}).subscribe({next:r=>{this.event.set(r.event);if(!r.event.votacaoPublicaAtiva||r.event.modoAvaliacao==='JURI'){this.error.set('Este evento é classificado apenas pelo júri e não possui votação pública.');this.candidates.set([]);}else{const agora=new Date();const inicio=r.event.inicioVotacao?new Date(r.event.inicioVotacao):null;const fim=r.event.fimVotacao?new Date(r.event.fimVotacao):null;if(inicio&&agora<inicio){this.error.set('A votação pública ainda não começou.');this.candidates.set([]);}else if(fim&&agora>fim){this.error.set('O período de votação pública terminou.');this.candidates.set([]);}else{this.candidates.set(r.candidates);}}this.loading.set(false)},error:e=>{this.error.set(e?.error?.message||e?.message||'Não foi possível carregar a votação.');this.loading.set(false)}})}
  select(c:Candidato){if(!this.success())this.selected.set(c)}
  async confirmVote(){const c=this.selected();if(!c)return;this.submitting.set(true);this.error.set('');const identificadorEleitor=await this.identificadorDispositivo();this.votes.votarPublico({eventoId:this.eventId,candidatoId:c.id,identificadorEleitor}).subscribe({next:()=>{localStorage.setItem('clc-voto-'+this.eventId,c.id);this.success.set(true);this.submitting.set(false);window.scrollTo({top:0,behavior:'smooth'})},error:e=>{this.error.set(e?.error?.mensagem||e?.error?.message||e?.message||'O voto foi recusado.');this.submitting.set(false);window.scrollTo({top:0,behavior:'smooth'})}})}
  private async identificadorDispositivo(){const raw=[navigator.userAgent,navigator.language,Intl.DateTimeFormat().resolvedOptions().timeZone,screen.width+'x'+screen.height,String(navigator.hardwareConcurrency||0),navigator.platform||''].join('|');const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('')}
  trackCandidate(_:number,c:Candidato){return c.id}
}
