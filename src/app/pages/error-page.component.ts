import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {LogoComponent} from '../shared/logo.component';

@Component({
  standalone: true,
  imports: [RouterLink, MatIconModule, LogoComponent],
  template: `
    <section class="error-page">
      <i class="orb o1"></i><i class="orb o2"></i>
      <a routerLink="/" class="logo" aria-label="Página inicial"><app-logo [compact]="true"/></a>

      <div class="content">
        <div class="icon"><mat-icon>travel_explore</mat-icon></div>
        <span class="code">404</span>
        <h1>Página não encontrada</h1>
        <p>O endereço que procura não existe ou foi movido. Verifique o link ou volte ao início.</p>
        <div class="actions">
          <a routerLink="/" class="btn primary"><mat-icon>home</mat-icon>Voltar ao início</a>
          <button type="button" class="btn ghost" (click)="back()"><mat-icon>arrow_back</mat-icon>Página anterior</button>
        </div>
      </div>
    </section>`,
  styles: [`
    .error-page{position:relative;min-height:100vh;display:grid;grid-template-rows:auto 1fr;padding:30px;overflow:hidden;color:#fff;
      background:linear-gradient(165deg,#150f3d,#0a071d)}
    .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
    .o1{width:480px;height:480px;right:-120px;top:-140px;background:rgba(var(--primary-rgb),.55);animation:float 14s ease-in-out infinite}
    .o2{width:360px;height:360px;left:-100px;bottom:-140px;background:rgba(var(--accent-rgb),.22);animation:float 18s ease-in-out infinite reverse}
    .logo{position:relative;z-index:1;text-decoration:none;justify-self:start}
    .content{position:relative;z-index:1;display:grid;justify-items:center;align-content:center;text-align:center;gap:6px;animation:rise .8s var(--ease) both}
    .icon{width:84px;height:84px;border-radius:26px;display:grid;place-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);animation:float 5s ease-in-out infinite}
    .icon mat-icon{font-size:42px;width:42px;height:42px;color:var(--accent)}
    .code{margin-top:10px;font-size:clamp(5rem,14vw,8.5rem);font-weight:800;line-height:1;letter-spacing:-.06em;
      background:linear-gradient(135deg,#fff 20%,var(--primary-2) 60%,var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent}
    h1{margin:6px 0 0;color:#fff;font-size:clamp(1.5rem,3vw,2.1rem)}
    p{margin:6px 0 0;max-width:44ch;color:rgba(226,222,248,.72);line-height:1.7}
    .actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:26px}
    .btn{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 22px;border-radius:14px;font-weight:700;font-size:.88rem;text-decoration:none;border:1px solid transparent}
    .btn mat-icon{font-size:20px;width:20px;height:20px}
    .primary{color:#fff;background:linear-gradient(135deg,var(--primary),var(--primary-2));box-shadow:0 12px 30px rgba(var(--primary-rgb),.4)}
    .primary:hover{transform:translateY(-2px)}
    .ghost{color:#fff;background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.22)}
    .ghost:hover{background:rgba(255,255,255,.16)}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  `]
})
export class ErrorPageComponent {
  constructor(private location: Location) {}
  back() { this.location.back(); }
}
