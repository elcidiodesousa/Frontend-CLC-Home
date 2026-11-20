import {Component, HostListener, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {LogoComponent} from '../shared/logo.component';
import {RevealDirective} from '../shared/reveal.directive';
import {LandingData, LandingService, EventoLanding} from '../core/landing.service';
import {AuthService} from '../core/auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, LogoComponent, RevealDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  data?: LandingData;

  readonly links = [
    {id: 'sobre', label: 'Sobre nós', icon: 'info'},
    {id: 'eventos', label: 'Eventos', icon: 'event'},
    {id: 'historico', label: 'Histórico', icon: 'history'},
    {id: 'equipa', label: 'Equipa', icon: 'groups'}
  ];

  scrolled = signal(false);
  menuOpen = signal(false);
  section = signal('');
  galeriaAberta = signal<EventoLanding | null>(null);
  aba = signal<'FOTO' | 'VIDEO'>('FOTO');
  mediaAtiva = signal<any | null>(null);

  constructor(private landing: LandingService, public auth: AuthService) {}

  ngOnInit() {
    this.landing.carregar().subscribe({
      next: x => this.data = x,
      error: () => this.data = {institucional: {nomeOrganizacao: 'CLC Home', numeroMembros: 0}, eventosActuais: [], historico: [], membros: []}
    });
  }

  /** Navbar ganha fundo ao rolar e a secção visível fica destacada. */
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
    let current = '';
    for (const l of this.links) {
      const el = document.getElementById(l.id);
      if (el && el.getBoundingClientRect().top <= 140) current = l.id;
    }
    this.section.set(current);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mediaAtiva()) this.mediaAtiva.set(null);
    else if (this.galeriaAberta()) this.fecharGaleria();
    this.menuOpen.set(false);
  }

  url(x?: string) {
    if (!x) return '';
    return x.startsWith('http') ? x : environment.apiUrl.replace('/api', '') + x;
  }

  capa(x: EventoLanding) {
    return x.galeria.find(m => m.destaque)?.mediaUrl || x.evento.cartazUrl || x.galeria.find(m => m.tipo === 'FOTO')?.mediaUrl;
  }

  emDestaque(x: EventoLanding) {
    return x.galeria.some(m => m.destaque);
  }

  destaque() {
    const todos = [...(this.data?.eventosActuais || []), ...(this.data?.historico || [])];
    return todos.flatMap(x => x.galeria).find(m => m.destaque) || todos.flatMap(x => x.galeria)[0];
  }

  fotos(x: EventoLanding) { return x.galeria.filter(m => m.tipo === 'FOTO').length; }
  videos(x: EventoLanding) { return x.galeria.filter(m => m.tipo === 'VIDEO').length; }

  abrirGaleria(x: EventoLanding) {
    this.galeriaAberta.set(x);
    this.aba.set(this.fotos(x) > 0 ? 'FOTO' : 'VIDEO');
    document.body.style.overflow = 'hidden';
  }

  fecharGaleria() {
    this.galeriaAberta.set(null);
    this.mediaAtiva.set(null);
    document.body.style.overflow = '';
  }

  mediasFiltradas() { return (this.galeriaAberta()?.galeria || []).filter(m => m.tipo === this.aba()); }
  selecionarMedia(m: any) { this.mediaAtiva.set(m); }
}
