import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone:true,
  imports:[RouterLink,MatIconModule],
  template:`<section class="error-page"><div class="icon"><mat-icon>sentiment_dissatisfied</mat-icon></div><span>404</span><h1>Página não encontrada</h1><p>O endereço solicitado não existe ou foi movido.</p><a routerLink="/"><mat-icon>home</mat-icon>Voltar ao início</a></section>`,
  styles:[`.error-page{min-height:100vh;display:grid;place-items:center;align-content:center;text-align:center;background:linear-gradient(145deg,#090d43,#24115e);color:#fff;padding:30px}.icon{width:90px;height:90px;border-radius:24px;display:grid;place-items:center;background:#ffffff18}.icon mat-icon{font-size:48px;width:48px;height:48px;color:#f6b323}.error-page>span{font-size:5rem;font-weight:800;margin-top:20px}.error-page h1{margin:0}.error-page p{color:#d4d7ec}.error-page a{display:flex;align-items:center;gap:8px;text-decoration:none;color:#fff;background:linear-gradient(90deg,#6d28d9,#7c3aed);padding:12px 18px;border-radius:11px;font-weight:800;margin-top:15px}`]
})
export class ErrorPageComponent {}
