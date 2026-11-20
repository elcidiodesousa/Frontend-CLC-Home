import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <section class="denied">
      <div class="icon"><mat-icon>lock_person</mat-icon></div>
      <h1>Acesso restrito</h1>
      <p>O seu perfil não tem permissão para abrir este módulo. Se precisa de acesso, fale com um administrador.</p>
      <a routerLink="/app/dashboard" class="back"><mat-icon>space_dashboard</mat-icon>Voltar ao início</a>
    </section>`,
  styles: [`
    .denied{max-width:520px;margin:6vh auto 0;padding:44px 34px;display:grid;justify-items:center;text-align:center;gap:6px;
      background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-xl);box-shadow:var(--shadow)}
    .icon{width:76px;height:76px;border-radius:24px;display:grid;place-items:center;margin-bottom:10px;background:var(--primary-soft);color:var(--primary);animation:pop-in .6s var(--ease) both}
    .icon mat-icon{font-size:38px;width:38px;height:38px}
    h1{margin:0;font-size:1.6rem}
    p{margin:6px 0 20px;line-height:1.7;max-width:42ch}
    .back{display:inline-flex;align-items:center;gap:8px;min-height:46px;padding:0 20px;border-radius:13px;text-decoration:none;color:#fff;font-weight:700;font-size:.86rem;
      background:linear-gradient(135deg,var(--primary),var(--primary-2));box-shadow:0 10px 26px rgba(var(--primary-rgb),.3)}
    .back:hover{transform:translateY(-2px)}
    .back mat-icon{font-size:20px;width:20px;height:20px}
  `]
})
export class AccessDeniedComponent {}
