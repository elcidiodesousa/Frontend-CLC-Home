import {CommonModule} from '@angular/common';
import {Component,OnInit,computed,signal} from '@angular/core';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {ResultService,Resultado} from '../core/result.service';
import {LogoComponent} from '../shared/logo.component';

@Component({standalone:true,imports:[CommonModule,RouterLink,MatIconModule,LogoComponent],template:`
<div class="results-page"><header><app-logo/><nav><a routerLink="/eventos">Eventos</a><a routerLink="/entrar">Entrar</a></nav></header>
<section class="hero"><span>Classificação oficial</span><h1>{{eventTitle()||'Resultados do evento'}}</h1><p>Conheça os talentos classificados em cada categoria.</p></section>
<main>
  <div class="loading" *ngIf="loading()">A carregar resultados...</div>
  <div class="empty" *ngIf="!loading()&&!results().length"><mat-icon>leaderboard</mat-icon><h2>Resultados ainda não publicados</h2><p>Volte depois do encerramento e publicação oficial do evento.</p></div>
  <section class="category" *ngFor="let group of grouped();trackBy:trackGroup">
    <div class="category-title"><div><span>Categoria</span><h2>{{group.name}}</h2></div><b>{{group.items.length}} classificados</b></div>
    <div class="podium" *ngIf="group.items.length">
      <article *ngFor="let r of group.items.slice(0,3);let i=index" [class.winner]="i===0"><div class="medal">{{i+1}}º</div><div class="avatar">{{r.candidatoNome.charAt(0)}}</div><h3>{{r.candidatoNome}}</h3><strong>{{r.pontuacaoFinal|number:'1.0-2'}} pts</strong><span><mat-icon>how_to_vote</mat-icon>{{r.totalVotos}} votos</span></article>
    </div>
    <div class="ranking" *ngIf="group.items.length>3"><div class="row" *ngFor="let r of group.items.slice(3);let i=index"><b>{{i+4}}º</b><span class="small-avatar">{{r.candidatoNome.charAt(0)}}</span><strong>{{r.candidatoNome}}</strong><span>{{r.totalVotos}} votos</span><em>{{r.pontuacaoFinal|number:'1.0-2'}} pts</em></div></div>
  </section>
</main></div>`,styles:[`
.results-page{min-height:100vh;background:var(--surface-soft);color:var(--text)}header{height:82px;padding:0 6vw;background:var(--ink);display:flex;align-items:center;justify-content:space-between}nav{display:flex;gap:18px}nav a{color:#fff;text-decoration:none;font-weight:800}.hero{text-align:center;padding:70px 6vw;color:#fff;background:radial-gradient(circle at 50% 120%,var(--primary-2) 0,transparent 55%),linear-gradient(130deg,var(--ink),#28115f)}.hero span,.category-title span{color:var(--accent);text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;font-weight:900}.hero h1{font-size:clamp(2.5rem,5vw,4.4rem);margin:10px 0}.hero p{color:#d9dcf3}main{max-width:1120px;margin:auto;padding:44px 24px 80px}.category{margin-bottom:36px}.category-title{display:flex;align-items:end;justify-content:space-between;margin-bottom:18px}.category-title span{color:var(--primary)}.category-title h2{margin:5px 0}.category-title b{color:var(--muted);font-size:.75rem}.podium{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:end}.podium article{position:relative;text-align:center;background:var(--surface);padding:28px 18px;border-radius:18px;box-shadow:0 14px 40px #14194612}.podium article.winner{padding-top:42px;border:2px solid var(--accent);transform:translateY(-10px)}.medal{position:absolute;top:14px;left:14px;width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:var(--primary-soft);color:var(--primary);font-weight:900}.winner .medal{background:var(--warning-soft);color:var(--warning-ink)}.avatar,.small-avatar{display:grid;place-items:center;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:900}.avatar{width:76px;height:76px;margin:10px auto;font-size:1.7rem}.podium h3{margin:10px 0}.podium strong{display:block;color:var(--primary);font-size:1.2rem}.podium span{margin-top:8px;display:flex;justify-content:center;align-items:center;gap:5px;color:var(--muted);font-size:.78rem}.podium mat-icon{font-size:17px;width:17px;height:17px}.ranking{margin-top:18px;background:var(--surface);border-radius:16px;overflow:hidden;box-shadow:0 12px 34px #1419460e}.row{display:grid;grid-template-columns:45px 38px 1fr 100px 90px;align-items:center;gap:12px;padding:14px 18px;border-top:1px solid var(--line)}.small-avatar{width:36px;height:36px}.row>span:nth-of-type(2){color:var(--muted);font-size:.78rem}.row em{text-align:right;color:var(--primary);font-style:normal;font-weight:900}.loading,.empty{text-align:center;background:var(--surface);padding:60px;border-radius:18px}.empty mat-icon{font-size:58px;width:58px;height:58px;color:var(--primary)}.empty p{color:var(--muted)}@media(max-width:700px){.podium{grid-template-columns:1fr}.podium article.winner{transform:none;order:-1}.row{grid-template-columns:36px 36px 1fr auto}.row>span:nth-of-type(2){display:none}}
`]})
export class ResultsComponent implements OnInit{
  results=signal<Resultado[]>([]);loading=signal(true);eventTitle=computed(()=>this.results()[0]?.eventoTitulo||'');grouped=computed(()=>{const map=new Map<string,Resultado[]>();for(const r of this.results()){const list=map.get(r.categoriaNome)||[];list.push(r);map.set(r.categoriaNome,list)}return [...map.entries()].map(([name,items])=>({name,items:items.sort((a,b)=>a.posicao-b.posicao||b.pontuacaoFinal-a.pontuacaoFinal)}))});
  constructor(private route:ActivatedRoute,private service:ResultService){}
  ngOnInit(){const id=this.route.snapshot.paramMap.get('eventoId')||'';this.service.porEvento(id).subscribe({next:r=>{this.results.set(r);this.loading.set(false)},error:()=>this.loading.set(false)})}
  trackGroup(_:number,g:{name:string}){return g.name}
}
