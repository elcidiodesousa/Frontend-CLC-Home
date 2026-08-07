import {Component, signal} from '@angular/core';
import {RouterLink,RouterLinkActive,RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../core/auth.service';
import {LogoComponent} from '../shared/logo.component';
import {ThemeService} from '../core/theme.service';

@Component({
  standalone:true,
  imports:[RouterOutlet,RouterLink,RouterLinkActive,MatIconModule,LogoComponent],
  template:`
  <div class="app-shell" [class.menu-open]="menuOpen()">
    <aside class="sidebar">
      <div class="brand-wrap"><app-logo/></div>
      <div class="profile-card">
        <div class="avatar">{{auth.user()?.email?.charAt(0)?.toUpperCase()}}</div>
        <div><strong>{{auth.user()?.role}}</strong><span>{{auth.user()?.email}}</span></div>
        <mat-icon>more_horiz</mat-icon>
      </div>
      <div class="nav-caption">Menu principal</div>
      <nav (click)="menuOpen.set(false)">
        <a routerLink="dashboard" routerLinkActive="active"><mat-icon>home</mat-icon><span>Início</span></a>
        @if(auth.isStaff()){
          <a routerLink="operacoes" routerLinkActive="active"><mat-icon>hub</mat-icon><span>Centro operacional</span></a>
          <a routerLink="eventos" routerLinkActive="active"><mat-icon>calendar_month</mat-icon><span>Eventos</span></a>
          <a routerLink="jurados" routerLinkActive="active"><mat-icon>workspace_premium</mat-icon><span>Jurados</span></a>
          <a routerLink="criterios" routerLinkActive="active"><mat-icon>fact_check</mat-icon><span>Critérios</span></a>
          <a routerLink="resultados" routerLinkActive="active"><mat-icon>leaderboard</mat-icon><span>Resultados</span></a>
          <a routerLink="monitor-avaliacoes" routerLinkActive="active"><mat-icon>monitoring</mat-icon><span>Monitor de avaliações</span></a>
          <a routerLink="equipa" routerLinkActive="active"><mat-icon>groups</mat-icon><span>Equipa</span></a>
          <a routerLink="conteudo-landing" routerLinkActive="active"><mat-icon>campaign</mat-icon><span>Conteúdo público</span></a>
          <a routerLink="financas" routerLinkActive="active"><mat-icon>account_balance_wallet</mat-icon><span>Finanças</span></a>
          <a routerLink="relatorios-eventos" routerLinkActive="active"><mat-icon>analytics</mat-icon><span>Relatórios</span></a>
          <a routerLink="certificados" routerLinkActive="active"><mat-icon>workspace_premium</mat-icon><span>Certificados</span></a>
          <a routerLink="marketing" routerLinkActive="active"><mat-icon>campaign</mat-icon><span>Marketing</span></a>
          <a routerLink="comunicacoes" routerLinkActive="active"><mat-icon>campaign</mat-icon><span>Comunicação</span></a>
        }
        @if(auth.isParticipante()){
          <a routerLink="inscricoes" routerLinkActive="active"><mat-icon>how_to_reg</mat-icon><span>Inscrições</span></a>
          <a routerLink="pagamentos" routerLinkActive="active"><mat-icon>payments</mat-icon><span>Pagamentos</span></a>
          <a routerLink="bilhetes" routerLinkActive="active"><mat-icon>confirmation_number</mat-icon><span>Bilhetes</span></a>
          <a routerLink="certificados" routerLinkActive="active"><mat-icon>workspace_premium</mat-icon><span>Certificados</span></a>
        }
        @if(auth.isJurado()||auth.isAdmin()){
          <a routerLink="avaliacoes" routerLinkActive="active"><mat-icon>rate_review</mat-icon><span>Avaliações</span></a>
        }
        @if(auth.isAdmin()){
          <div class="nav-caption section">Administração</div>
          <a routerLink="administracao" routerLinkActive="active"><mat-icon>manage_accounts</mat-icon><span>Utilizadores</span></a>
          <a routerLink="cargos-internos" routerLinkActive="active"><mat-icon>badge</mat-icon><span>Cargos internos</span></a>
          <a routerLink="auditoria" routerLinkActive="active"><mat-icon>history</mat-icon><span>Histórico</span></a>
          <a routerLink="configuracoes" routerLinkActive="active"><mat-icon>palette</mat-icon><span>Aparência</span></a>
        }
        <div class="nav-caption section">Conta</div>
        <a routerLink="perfil" routerLinkActive="active"><mat-icon>person</mat-icon><span>Meu perfil</span></a>
        <a routerLink="notificacoes" routerLinkActive="active"><mat-icon>notifications</mat-icon><span>Notificações</span><i></i></a>
      </nav>
      <div class="promo"><mat-icon>auto_awesome</mat-icon><strong>Viva experiências memoráveis</strong><span>Descubra eventos, talentos e cultura num só lugar.</span></div>
      <button class="logout" (click)="auth.logout()"><mat-icon>logout</mat-icon><span>Terminar sessão</span></button>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <button class="menu-btn" (click)="menuOpen.set(!menuOpen())" aria-label="Abrir menu"><mat-icon>menu</mat-icon></button>
        <label class="search"><mat-icon>search</mat-icon><input placeholder="Pesquisar eventos, participantes ou bilhetes..."></label>
        <div class="spacer"></div>
        <button class="theme-btn" (click)="toggleTheme()" title="Alternar tema"><mat-icon>{{dark()?'light_mode':'dark_mode'}}</mat-icon></button>
        <a class="notification" routerLink="notificacoes" aria-label="Notificações"><mat-icon>notifications_none</mat-icon><i></i></a>
        <a class="mini-profile" routerLink="perfil"><div>{{auth.user()?.email?.charAt(0)?.toUpperCase()}}</div><span><b>{{auth.user()?.email}}</b><small>{{auth.user()?.role}}</small></span><mat-icon>expand_more</mat-icon></a>
      </header>
      <main><router-outlet/></main>
    </section>
    <button class="backdrop" (click)="menuOpen.set(false)" aria-label="Fechar menu"></button>
  </div>`,
  styles:[`
    .app-shell{min-height:100vh;display:grid;grid-template-columns:242px minmax(0,1fr);background:transparent}.sidebar{height:100vh;position:sticky;top:0;z-index:20;padding:18px 14px;background:var(--sidebar);color:#fff;display:flex;flex-direction:column;border-right:1px solid #ffffff10}.brand-wrap{padding:3px 8px 14px}.profile-card{display:grid;grid-template-columns:40px minmax(0,1fr) 20px;align-items:center;gap:10px;padding:11px;margin:6px 0 18px;background:#ffffff08;border:1px solid #ffffff10;border-radius:14px}.avatar,.mini-profile>div{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(145deg,var(--primary),var(--primary-2));font-weight:800;color:#fff;box-shadow:0 8px 22px rgba(var(--primary-rgb),.28)}.profile-card>div:nth-child(2){min-width:0;display:flex;flex-direction:column}.profile-card strong{font-size:.72rem;text-transform:capitalize}.profile-card span{font-size:.62rem;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-card>mat-icon{font-size:18px;color:#64748b}.nav-caption{padding:0 12px 8px;color:#596579;font-size:.58rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.nav-caption.section{margin-top:13px;padding-top:7px}nav{display:flex;flex-direction:column;gap:3px;overflow:auto;padding-right:2px}nav a,.logout{position:relative;min-height:42px;display:flex;align-items:center;gap:11px;padding:0 12px;border-radius:10px;color:#9aa6ba;text-decoration:none;border:0;background:transparent;font:inherit;font-size:.76rem;font-weight:650;cursor:pointer;text-align:left}nav a mat-icon,.logout mat-icon{font-size:20px;width:20px;height:20px}nav a:hover,.logout:hover{color:#fff;background:#ffffff0a}.active{color:#fff!important;background:linear-gradient(90deg,rgba(var(--primary-rgb),.92),rgba(var(--primary-rgb),.55))!important;box-shadow:0 10px 22px rgba(var(--primary-rgb),.18)}.active:before{content:"";position:absolute;left:-14px;width:3px;height:22px;border-radius:0 4px 4px 0;background:var(--primary-2)}nav a i{width:6px;height:6px;border-radius:50%;background:var(--primary-2);margin-left:auto}.promo{margin:16px 6px 12px;padding:16px;border-radius:16px;background:linear-gradient(145deg,rgba(var(--primary-rgb),.28),rgba(var(--primary-rgb),.08));border:1px solid rgba(var(--primary-rgb),.25);display:flex;flex-direction:column;gap:7px}.promo mat-icon{color:var(--primary-2)}.promo strong{font-size:.8rem}.promo span{font-size:.64rem;color:#a9b3c5}.logout{margin-top:auto;width:100%;color:#e1a3ab}.workspace{min-width:0}.topbar{height:66px;position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;padding:0 25px;background:var(--topbar);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.menu-btn,.theme-btn,.notification{width:38px;height:38px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);display:grid;place-items:center;cursor:pointer;text-decoration:none}.menu-btn{display:none}.theme-btn:hover,.notification:hover{color:var(--primary-2);border-color:rgba(var(--primary-rgb),.45)}.search{width:min(460px,45vw);height:40px;display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid var(--line);border-radius:11px;background:var(--surface-soft);color:var(--muted)}.search input{width:100%;border:0!important;background:transparent!important;box-shadow:none!important;padding:0;color:var(--text);font-size:.72rem}.spacer{flex:1}.notification{position:relative}.notification i{position:absolute;right:7px;top:6px;width:7px;height:7px;border-radius:50%;background:var(--primary-2);border:2px solid var(--surface)}.mini-profile{display:flex;align-items:center;gap:9px;margin-left:2px;padding-left:10px;border-left:1px solid var(--line);text-decoration:none}.mini-profile>div{width:34px;height:34px;border-radius:10px}.mini-profile span{display:flex;flex-direction:column;max-width:170px}.mini-profile b{font-size:.66rem;color:var(--text);overflow:hidden;text-overflow:ellipsis}.mini-profile small{font-size:.58rem;color:var(--muted);text-transform:capitalize}.mini-profile mat-icon{font-size:18px;color:var(--muted)}main{padding:24px;max-width:1600px;margin:0 auto}.backdrop{display:none}:host-context(.compact-navigation) .app-shell{grid-template-columns:82px minmax(0,1fr)}:host-context(.compact-navigation) .sidebar{padding-inline:10px}:host-context(.compact-navigation) .profile-card>div:nth-child(2),:host-context(.compact-navigation) nav a span,:host-context(.compact-navigation) .nav-caption,:host-context(.compact-navigation) .promo,:host-context(.compact-navigation) .logout span{display:none}:host-context(.compact-navigation) nav a,:host-context(.compact-navigation) .logout{justify-content:center}:host-context(.compact-navigation) .profile-card{grid-template-columns:1fr;justify-items:center}:host-context(.compact-navigation) .profile-card>mat-icon{display:none}@media(max-width:900px){.app-shell{grid-template-columns:1fr!important}.sidebar{position:fixed;left:0;transform:translateX(-102%);width:250px;transition:transform .22s ease}.menu-open .sidebar{transform:translateX(0)}.menu-btn{display:grid}.backdrop{position:fixed;inset:0;z-index:15;border:0;background:#030712aa}.menu-open .backdrop{display:block}.mini-profile span,.mini-profile>mat-icon{display:none}.search{width:min(360px,55vw)}main{padding:18px}.topbar{padding:0 16px}}@media(max-width:560px){.search{display:none}main{padding:14px}}
  `]
})
export class ShellComponent{
  menuOpen=signal(false);dark=signal(document.documentElement.dataset['theme']!=='light');
  constructor(public auth:AuthService,private theme:ThemeService){}
  toggleTheme(){const settings=this.theme.load();settings.mode=this.dark()?'light':'dark';this.theme.save(settings);this.dark.set(!this.dark())}
}
