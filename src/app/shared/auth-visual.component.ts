import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {LogoComponent} from './logo.component';

/** Painel de marca usado nas páginas de entrada e registo. */
@Component({
  selector: 'app-auth-visual',
  standalone: true,
  imports: [RouterLink, MatIconModule, LogoComponent],
  template: `
    <aside class="visual">
      <i class="orb o1"></i><i class="orb o2"></i>
      <a routerLink="/" class="logo" aria-label="Página inicial"><app-logo/></a>
      <div class="copy">
        <h1>{{ title }}</h1>
        <p>{{ text }}</p>
        <ul>
          <li><span><mat-icon>confirmation_number</mat-icon></span>Inscrições e bilhetes num só lugar</li>
          <li><span><mat-icon>how_to_vote</mat-icon></span>Votação e resultados transparentes</li>
          <li><span><mat-icon>verified</mat-icon></span>Certificados com verificação oficial</li>
        </ul>
      </div>
      <small>© 2026 CLC Home</small>
    </aside>`,
  styles: [`
    :host{display:block}
    .visual{position:relative;height:100%;min-height:100vh;display:flex;flex-direction:column;gap:30px;padding:42px 54px;overflow:hidden;color:#fff;
      background:linear-gradient(165deg,#150f3d,#0b0822 70%)}
    .orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}
    .o1{width:420px;height:420px;right:-140px;top:-120px;background:rgba(var(--primary-rgb),.6);animation:float 14s ease-in-out infinite}
    .o2{width:340px;height:340px;left:-120px;bottom:-120px;background:rgba(var(--accent-rgb),.25);animation:float 18s ease-in-out infinite reverse}
    .logo{position:relative;z-index:1;text-decoration:none;align-self:flex-start}
    .copy{position:relative;z-index:1;margin:auto 0;max-width:500px}
    h1{margin:0 0 16px;font-size:clamp(2.2rem,3.6vw,3.2rem);line-height:1.08;letter-spacing:-.045em;color:#fff;font-weight:800;text-wrap:balance}
    p{margin:0;color:rgba(226,222,248,.75);font-size:1rem;line-height:1.75;max-width:44ch}
    ul{list-style:none;margin:34px 0 0;padding:0;display:grid;gap:14px}
    li{display:flex;align-items:center;gap:14px;color:rgba(240,238,255,.9);font-size:.9rem;font-weight:600}
    li span{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--accent);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
    li mat-icon{font-size:21px;width:21px;height:21px}
    small{position:relative;z-index:1;color:rgba(226,222,248,.4);font-size:.76rem}
    .copy>*{animation:rise .9s var(--ease) both}.copy p{animation-delay:.08s}.copy ul{animation-delay:.16s}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  `]
})
export class AuthVisualComponent {
  @Input() title = 'Eventos que conectam talentos.';
  @Input() text = 'Gestão completa de eventos, inscrições, avaliações e resultados.';
}
