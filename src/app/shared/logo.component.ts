import {Component, Input} from '@angular/core';

/**
 * Marca CLC Home.
 * - `compact`: esconde o slogan.
 * - `tone="light"`: texto escuro, para fundos claros (por defeito o texto é branco).
 */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="brand" [class.on-light]="tone==='light'">
      <img class="mark" src="assets/clc-mark.svg" alt="" width="44" height="44">
      <div class="word">
        <div class="name"><b>CLC</b><span>HOME</span></div>
        @if (!compact) { <small>Celebrando talentos, conectando sonhos</small> }
      </div>
    </div>`,
  styles: [`
    :host{display:inline-block}
    .brand{display:flex;align-items:center;gap:11px;color:#fff;line-height:1}
    .brand.on-light{color:var(--text)}
    .mark{width:44px;height:44px;flex:none;filter:drop-shadow(0 6px 14px rgba(106,61,240,.45))}
    .name{display:flex;align-items:baseline;gap:6px;font-size:1.3rem;letter-spacing:-.01em}
    .name b{font-weight:800}
    .name span{font-weight:800;color:var(--accent);letter-spacing:.12em;font-size:.95rem}
    small{display:block;margin-top:5px;font-size:.6rem;font-weight:500;letter-spacing:.02em;color:rgba(255,255,255,.62)}
    .on-light small{color:var(--muted)}
  `]
})
export class LogoComponent {
  @Input() compact = false;
  @Input() tone: 'dark' | 'light' = 'dark';
}
