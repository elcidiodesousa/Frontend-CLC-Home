import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {NotificationService} from '../core/notification.service';

@Component({
  standalone:true,
  imports:[DatePipe,MatIconModule],
  template:`
  <section class="heading">
    <div><span>Centro de notificações</span><h1>Notificações</h1><p>Acompanhe actividades relevantes da sua conta.</p></div>
    <button (click)="notifications.markAllAsRead()"><mat-icon>done_all</mat-icon>Marcar todas como lidas</button>
  </section>

  <section class="list">
    @for(item of notifications.items(); track item.id) {
      <article [class.unread]="!item.lida" (click)="notifications.markAsRead(item.id)">
        <div class="icon" [class.success]="item.tipo==='SUCESSO'" [class.alert]="item.tipo==='ALERTA'">
          <mat-icon>{{item.tipo==='SUCESSO'?'check_circle':item.tipo==='ALERTA'?'warning':'notifications'}}</mat-icon>
        </div>
        <div class="content"><strong>{{item.titulo}}</strong><p>{{item.mensagem}}</p><small>{{item.data | date:'dd/MM/yyyy HH:mm'}}</small></div>
        @if(!item.lida){<span class="dot"></span>}
      </article>
    }
  </section>
  `,
  styles:[`
  .heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.heading span{color:var(--primary);text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;font-weight:800}.heading h1{margin:6px 0;color:var(--text)}.heading p{margin:0;color:var(--muted)}.heading button{display:flex;align-items:center;gap:8px;border:0;padding:12px 16px;border-radius:11px;background:var(--ink);color:#fff;font-weight:800}.list{display:grid;gap:12px}.list article{display:grid;grid-template-columns:48px 1fr 14px;gap:14px;align-items:center;background:var(--surface);padding:18px;border-radius:15px;box-shadow:0 8px 28px #1419460d;cursor:pointer}.list article.unread{border-left:4px solid var(--primary)}.icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)}.icon.success{background:var(--success-soft);color:var(--success-ink)}.icon.alert{background:var(--warning-soft);color:var(--warning-ink)}.content{display:flex;flex-direction:column}.content strong{color:var(--text)}.content p{margin:5px 0;color:var(--muted)}.content small{color:var(--muted)}.dot{width:9px;height:9px;border-radius:50%;background:var(--primary)}@media(max-width:650px){.heading button{display:none}}
  `]
})
export class NotificationsComponent {
  constructor(public readonly notifications: NotificationService) {}
}
