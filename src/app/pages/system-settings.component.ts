import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ClcThemeSettings, ThemePalette, ThemeService} from '../core/theme.service';

@Component({
  standalone:true,
  imports:[FormsModule,MatIconModule],
  template:`
  <section class="heading"><div><span>Personalização</span><h1>Aparência do CLC Home</h1><p>Adapte as cores, o fundo e a navegação à identidade do seu evento.</p></div><button (click)="save()"><mat-icon>check</mat-icon>Aplicar alterações</button></section>
  @if(saved){<div class="success"><mat-icon>check_circle</mat-icon><div><strong>Personalização aplicada</strong><span>As preferências foram guardadas neste dispositivo.</span></div></div>}
  <section class="settings-grid">
    <article class="appearance">
      <div class="title"><mat-icon>palette</mat-icon><div><h2>Paleta de cores</h2><p>Escolha a cor principal de toda a plataforma.</p></div></div>
      <div class="palettes">
        @for(p of palettes;track p.id){<button type="button" [class.selected]="settings.palette===p.id" (click)="choosePalette(p.id)" [style.--swatch]="p.color"><i></i><span>{{p.name}}</span><mat-icon>check_circle</mat-icon></button>}
      </div>
      <div class="title subsection"><mat-icon>contrast</mat-icon><div><h2>Tema de fundo</h2><p>Use o modo escuro profissional ou uma versão clara.</p></div></div>
      <div class="mode-options"><button type="button" [class.selected]="settings.mode==='dark'" (click)="chooseMode('dark')"><div class="preview dark-preview"><i></i><i></i><i></i></div><strong>Escuro</strong><span>Elegante e confortável</span></button><button type="button" [class.selected]="settings.mode==='light'" (click)="chooseMode('light')"><div class="preview light-preview"><i></i><i></i><i></i></div><strong>Claro</strong><span>Limpo e luminoso</span></button></div>
    </article>

    <article>
      <div class="title"><mat-icon>tune</mat-icon><div><h2>Identidade da plataforma</h2><p>Textos visíveis na navegação principal.</p></div></div>
      <label>Nome da plataforma<input [(ngModel)]="settings.name" placeholder="CLC Home"></label>
      <label>Slogan<input [(ngModel)]="settings.slogan" placeholder="Gestão de eventos e talentos"></label>
      <label class="switch-row"><span><b>Navegação compacta</b><small>Reduz a barra lateral para dar mais espaço ao conteúdo.</small></span><input type="checkbox" [(ngModel)]="settings.compact"></label>
    </article>

    <article>
      <div class="title"><mat-icon>notifications_active</mat-icon><div><h2>Notificações úteis</h2><p>Escolha os avisos realmente importantes para a equipa.</p></div></div>
      <label class="switch-row"><span><b>Novas inscrições</b><small>Avisar quando um participante concluir a inscrição.</small></span><input type="checkbox" [(ngModel)]="alerts.registration"></label>
      <label class="switch-row"><span><b>Pagamentos</b><small>Avisar sobre confirmações, falhas e pagamentos pendentes.</small></span><input type="checkbox" [(ngModel)]="alerts.payment"></label>
      <label class="switch-row"><span><b>Resultados publicados</b><small>Avisar a equipa e os participantes quando houver resultados.</small></span><input type="checkbox" [(ngModel)]="alerts.results"></label>
    </article>

    <article class="preview-card">
      <div class="title"><mat-icon>visibility</mat-icon><div><h2>Pré-visualização</h2><p>Exemplo do novo estilo aplicado ao sistema.</p></div></div>
      <div class="system-preview"><div class="preview-side"><span></span><i></i><i></i><i></i></div><div class="preview-main"><div class="preview-top"></div><div class="preview-content"><div class="preview-title"></div><div class="preview-cards"><i></i><i></i><i></i></div><div class="preview-panel"></div></div></div></div>
      <div class="quality"><mat-icon>verified</mat-icon><div><strong>Interface profissional e consistente</strong><span>A configuração visual é aplicada em todas as telas do CLC Home.</span></div></div>
    </article>
  </section>`,
  styles:[`
  .success{display:flex;align-items:center;gap:11px;padding:14px 16px;margin-bottom:18px;border:1px solid #22c55e44;border-radius:14px;background:#22c55e12;color:#86efac}.success div{display:flex;flex-direction:column}.success span{font-size:.7rem;color:var(--muted)}.settings-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:18px}.settings-grid article{background:var(--surface);padding:22px;border-radius:18px;box-shadow:var(--shadow-sm)}.title{display:flex;gap:12px;align-items:center;margin-bottom:20px}.title>mat-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:rgba(var(--primary-rgb),.14);color:var(--primary-2)}.title h2{margin:0;font-size:1rem}.title p{margin:4px 0 0;color:var(--muted);font-size:.7rem}.subsection{margin-top:26px}.palettes{display:grid;grid-template-columns:repeat(5,1fr);gap:9px}.palettes button{position:relative;border:1px solid var(--line);border-radius:12px;background:var(--surface-soft);padding:12px 7px;color:var(--muted);display:grid;place-items:center;gap:7px;font-size:.65rem;cursor:pointer}.palettes button i{width:27px;height:27px;border-radius:50%;background:var(--swatch);box-shadow:0 0 0 5px color-mix(in srgb,var(--swatch) 17%,transparent)}.palettes button mat-icon{position:absolute;top:5px;right:5px;font-size:16px;opacity:0;color:var(--swatch)}.palettes button.selected{border-color:var(--swatch);color:var(--text)}.palettes button.selected mat-icon{opacity:1}.mode-options{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mode-options>button{border:1px solid var(--line);border-radius:14px;background:var(--surface-soft);padding:10px;text-align:left;color:var(--text);cursor:pointer}.mode-options>button.selected{border-color:var(--primary);box-shadow:0 0 0 3px rgba(var(--primary-rgb),.12)}.mode-options strong,.mode-options span{display:block;margin:6px 3px 0}.mode-options span{font-size:.65rem;color:var(--muted)}.preview{height:78px;border-radius:9px;padding:8px;display:grid;grid-template-columns:24px 1fr;grid-template-rows:12px 1fr;gap:6px}.preview:before{content:"";grid-row:1/3;border-radius:5px;background:#111827}.preview i{border-radius:4px;background:#334155}.preview i:first-of-type{grid-column:2}.dark-preview{background:#070b16}.light-preview{background:#eef2f7}.light-preview i{background:#cbd5e1}.light-preview:before{background:#172033}label:not(.switch-row){display:grid;gap:7px;margin:15px 0;color:var(--text);font-size:.75rem;font-weight:800}label input:not([type=checkbox]){height:44px;padding:0 12px}.switch-row{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:14px 0;border-top:1px solid var(--line)}.switch-row span{display:flex;flex-direction:column}.switch-row b{font-size:.76rem}.switch-row small{color:var(--muted);font-size:.65rem;margin-top:3px;font-weight:500}.switch-row input{width:42px;height:23px;accent-color:var(--primary)}.system-preview{height:215px;border:1px solid var(--line);border-radius:14px;overflow:hidden;display:grid;grid-template-columns:54px 1fr;background:var(--bg)}.preview-side{background:var(--sidebar);padding:9px;display:flex;flex-direction:column;gap:8px}.preview-side span{height:20px;border-radius:5px;background:linear-gradient(90deg,var(--primary),var(--primary-2));margin-bottom:8px}.preview-side i{height:17px;border-radius:5px;background:#ffffff12}.preview-top{height:34px;background:var(--topbar);border-bottom:1px solid var(--line)}.preview-content{padding:14px}.preview-title{width:40%;height:12px;border-radius:5px;background:var(--text);opacity:.8}.preview-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.preview-cards i,.preview-panel{height:46px;border-radius:8px;background:var(--surface);border:1px solid var(--line)}.preview-panel{height:78px}.quality{display:flex;gap:10px;margin-top:14px;padding:13px;background:rgba(var(--primary-rgb),.08);border-radius:12px}.quality mat-icon{color:var(--primary-2)}.quality div{display:flex;flex-direction:column}.quality strong{font-size:.75rem}.quality span{color:var(--muted);font-size:.65rem;margin-top:3px}@media(max-width:960px){.settings-grid{grid-template-columns:1fr}}@media(max-width:560px){.palettes{grid-template-columns:repeat(3,1fr)}}
  `]
})
export class SystemSettingsComponent{
  saved=false;
  palettes:{id:ThemePalette;name:string;color:string}[]=[{id:'original',name:'CLC Original',color:'#5b4ee8'},{id:'violet',name:'Violeta',color:'#7c3aed'},{id:'blue',name:'Azul',color:'#2563eb'},{id:'emerald',name:'Verde',color:'#059669'},{id:'amber',name:'Dourado',color:'#d97706'},{id:'rose',name:'Rosa',color:'#e11d48'}];
  settings:ClcThemeSettings;
  alerts={registration:true,payment:true,results:true};
  constructor(private theme:ThemeService){this.settings=this.theme.load();try{this.alerts={...this.alerts,...JSON.parse(localStorage.getItem('clc_alert_preferences')||'{}')}}catch{}}
  choosePalette(p:ThemePalette){this.settings.palette=p;this.theme.apply(this.settings)}
  chooseMode(mode:'dark'|'light'){this.settings.mode=mode;this.theme.apply(this.settings)}
  save(){this.theme.save(this.settings);localStorage.setItem('clc_alert_preferences',JSON.stringify(this.alerts));this.saved=true;setTimeout(()=>this.saved=false,2500)}
}
