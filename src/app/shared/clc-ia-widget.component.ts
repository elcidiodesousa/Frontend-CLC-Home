import {Component, computed, effect, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ClcIaService} from '../core/clc-ia.service';
import {AuthService} from '../core/auth.service';

type Msg={autor:'user'|'ai';texto:string;sugestoes?:string[]};

@Component({selector:'app-clc-ia-widget',standalone:true,imports:[FormsModule,MatIconModule],template:`
<button class="launcher" (click)="aberto.set(!aberto())" [attr.aria-label]="aberto()?'Fechar CLC IA':'Abrir CLC IA'">
  @if(aberto()){<mat-icon>close</mat-icon>}@else{<mat-icon>smart_toy</mat-icon><i></i>}
</button>
@if(aberto()){
<section class="chat" role="dialog" aria-label="Conversa com a CLC IA">
  <header><div class="bot"><mat-icon>auto_awesome</mat-icon></div><div><strong>CLC IA</strong><span>{{subtitulo()}}</span></div><button (click)="aberto.set(false)" aria-label="Minimizar"><mat-icon>remove</mat-icon></button></header>
  <div class="messages">
    @for(m of mensagens();track $index){<div class="row" [class.user]="m.autor==='user'"><div class="bubble">{{m.texto}}</div></div>
      @if(m.autor==='ai'&&m.sugestoes?.length){<div class="chips">@for(s of m.sugestoes;track s){<button (click)="enviarSugestao(s)">{{s}}</button>}</div>}
    }
    @if(carregando()){<div class="row"><div class="bubble typing"><i></i><i></i><i></i></div></div>}
  </div>
  <form (ngSubmit)="enviar()"><input [(ngModel)]="texto" name="mensagem" maxlength="1000" [placeholder]="placeholder()" autocomplete="off"><button [disabled]="carregando()||!texto.trim()" aria-label="Enviar mensagem"><mat-icon>send</mat-icon></button></form>
  <small>Não envie PIN, palavra-passe ou chaves secretas.</small>
</section>}
`,styles:[`
.launcher{position:fixed;right:22px;bottom:22px;z-index:1000;width:58px;height:58px;border:0;border-radius:18px;background:linear-gradient(145deg,#6255e8,#4338ca);color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 16px 38px #3026a85e}.launcher mat-icon{font-size:27px;width:27px;height:27px}.launcher i{position:absolute;right:7px;top:7px;width:10px;height:10px;border-radius:50%;background:#38d996;border:2px solid #fff}.chat{position:fixed;right:22px;bottom:92px;z-index:999;width:min(390px,calc(100vw - 28px));height:min(610px,calc(100vh - 120px));background:#fff;border:1px solid #e5e7ef;border-radius:22px;box-shadow:0 25px 70px #151a3340;display:flex;flex-direction:column;overflow:hidden}header{height:74px;display:flex;align-items:center;gap:11px;padding:0 16px;background:linear-gradient(125deg,#151a36,#27204f);color:#fff}.bot{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#776bf2,#4c3ed5)}header div:nth-child(2){display:flex;flex-direction:column;flex:1}header strong{font-size:.92rem}header span{font-size:.68rem;color:#b9bdd2}header button{border:0;background:#ffffff12;color:#fff;border-radius:9px;width:34px;height:34px;display:grid;place-items:center;cursor:pointer}.messages{flex:1;overflow:auto;padding:16px;background:#f6f7fb;white-space:pre-line}.row{display:flex;margin:0 0 10px}.row.user{justify-content:flex-end}.bubble{max-width:82%;padding:11px 13px;border-radius:16px 16px 16px 5px;background:#fff;color:#34394e;font-size:.79rem;line-height:1.48;box-shadow:0 5px 16px #1a21400d}.user .bubble{border-radius:16px 16px 5px 16px;background:#5a4de2;color:#fff}.chips{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 13px}.chips button{border:1px solid #dcdcf0;background:#fff;color:#5145c9;border-radius:999px;padding:7px 10px;font-size:.66rem;cursor:pointer}.typing{display:flex;gap:4px}.typing i{width:6px;height:6px;border-radius:50%;background:#7c8298;animation:pulse 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes pulse{50%{opacity:.25;transform:translateY(-2px)}}form{display:grid;grid-template-columns:1fr 43px;gap:8px;padding:12px 12px 5px;background:#fff;border-top:1px solid #eceef4}input{min-width:0;border:1px solid #dfe2eb;border-radius:13px;padding:0 13px;outline:none;font:inherit;font-size:.78rem}input:focus{border-color:#6659e6;box-shadow:0 0 0 3px #6659e614}form button{height:42px;border:0;border-radius:12px;background:#5b4ee4;color:#fff;display:grid;place-items:center;cursor:pointer}form button:disabled{opacity:.45}section>small{padding:4px 14px 10px;text-align:center;color:#9ba0b1;font-size:.56rem;background:#fff}@media(max-width:520px){.launcher{right:14px;bottom:14px}.chat{right:14px;bottom:82px;height:calc(100vh - 105px)}}
`]})
export class ClcIaWidgetComponent{
  aberto=signal(false);
  carregando=signal(false);
  texto='';

  private identidadeAnterior='';
  readonly identidade=computed(()=>this.auth.user()?.email ?? 'publico');
  readonly subtitulo=computed(()=>this.auth.logged()?'Assistente inteligente • sessão autenticada':'Assistente inteligente • acesso público');
  readonly placeholder=computed(()=>this.auth.logged()?'Pergunte sobre a sua conta ou qualquer assunto...':'Pergunte sobre eventos ou qualquer assunto...');

  sessaoId:string|null=null;
  mensagens=signal<Msg[]>([]);

  constructor(private ia:ClcIaService,public auth:AuthService){
    effect(()=>{
      const identidade=this.identidade();
      if(identidade===this.identidadeAnterior)return;
      this.identidadeAnterior=identidade;
      this.sessaoId=localStorage.getItem(this.chaveSessao(identidade));
      this.mensagens.set([this.boasVindas()]);
    });
  }

  private chaveSessao(identidade:string){return `clc_ia_sessao_${identidade}`;}
  private boasVindas():Msg{
    if(this.auth.logged()){
      return {autor:'ai',texto:'Olá! Sou a CLC IA. Posso responder perguntas gerais e ajudar com informações autorizadas da tua conta no CLC Home. Como posso ajudar?',sugestoes:['Os meus eventos','Estado das minhas inscrições','Os meus bilhetes']};
    }
    return {autor:'ai',texto:'Olá! Sou a CLC IA, assistente do CLC Home. Posso ajudar a encontrar eventos, explicar inscrições e bilhetes ou responder a perguntas gerais.',sugestoes:['Ver eventos publicados','Como me inscrever?','Como comprar bilhete?']};
  }

  enviarSugestao(s:string){this.texto=s;this.enviar();}
  enviar(){
    const msg=this.texto.trim();
    if(!msg||this.carregando())return;
    this.mensagens.update(v=>[...v,{autor:'user',texto:msg}]);
    this.texto='';
    this.carregando.set(true);
    this.ia.conversar(msg,this.sessaoId).subscribe({
      next:r=>{
        this.sessaoId=r.sessaoId;
        localStorage.setItem(this.chaveSessao(this.identidade()),r.sessaoId);
        this.mensagens.update(v=>[...v,{autor:'ai',texto:r.resposta,sugestoes:r.sugestoes}]);
        this.carregando.set(false);
      },
      error:err=>{
        const detalhe=err?.error?.message||err?.error?.detail;
        this.mensagens.update(v=>[...v,{autor:'ai',texto:detalhe?`Estou com dificuldade para consultar o sistema agora: ${detalhe}. Tenta novamente.`:'Estou com dificuldade para responder neste momento. Tenta novamente ou reformula a pergunta.'}]);
        this.carregando.set(false);
      }
    });
  }
}
