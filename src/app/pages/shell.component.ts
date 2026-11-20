import {Component, ElementRef, HostListener, ViewChild, computed, inject, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {filter} from 'rxjs';
import {AuthService} from '../core/auth.service';
import {NotificationService, AppNotification} from '../core/notification.service';
import {ThemeService} from '../core/theme.service';
import {LogoComponent} from '../shared/logo.component';

interface NavItem {label: string; icon: string; link: string; badge?: boolean; keywords?: string}
interface NavGroup {title: string; items: NavItem[]}
interface SearchHit extends NavItem {group: string}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador', STAFF: 'Equipa', JURADO: 'Jurado', PARTICIPANTE: 'Participante', VISITANTE: 'Visitante'
};

/** Páginas que não aparecem no menu mas precisam de título no cabeçalho. */
const EXTRA_TITLES: Record<string, {title: string; section: string}> = {
  '/app/categorias': {title: 'Categorias e candidatos', section: 'Eventos'},
  '/app/sem-permissao': {title: 'Acesso restrito', section: 'Geral'}
};

const normalize = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, LogoComponent, DatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly notifications = inject(NotificationService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly menuOpen = signal(false);
  readonly compact = signal(this.theme.load().compact);
  readonly dark = signal(document.documentElement.dataset['theme'] === 'dark');
  readonly dropdown = signal<'' | 'notif' | 'user'>('');
  readonly searchOpen = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly url = signal(this.router.url);

  /** Menu lateral, organizado por secções e filtrado pelo perfil do utilizador. */
  readonly groups = computed<NavGroup[]>(() => {
    const a = this.auth;
    const groups: NavGroup[] = [];

    const geral: NavItem[] = [{label: 'Início', icon: 'space_dashboard', link: '/app/dashboard', keywords: 'dashboard resumo'}];
    if (a.isStaff()) geral.push({label: 'Centro operacional', icon: 'hub', link: '/app/operacoes', keywords: 'operacoes'});
    groups.push({title: 'Geral', items: geral});

    const eventos: NavItem[] = [];
    if (a.isStaff()) eventos.push({label: 'Eventos', icon: 'calendar_month', link: '/app/eventos', keywords: 'agenda'});
    if (a.isParticipante()) {
      eventos.push(
        {label: 'Inscrições', icon: 'how_to_reg', link: '/app/inscricoes'},
        {label: 'Pagamentos', icon: 'payments', link: '/app/pagamentos', keywords: 'mpesa emola'},
        {label: 'Bilhetes', icon: 'confirmation_number', link: '/app/bilhetes', keywords: 'ticket qr'},
        {label: 'Certificados', icon: 'verified', link: '/app/certificados'}
      );
    }
    if (a.isJurado() || a.isAdmin()) eventos.push({label: 'Avaliações', icon: 'rate_review', link: '/app/avaliacoes', keywords: 'jurado notas'});
    groups.push({title: 'Eventos', items: eventos});

    if (a.isStaff()) {
      groups.push({title: 'Gestão', items: [
        {label: 'Jurados', icon: 'gavel', link: '/app/jurados'},
        {label: 'Critérios', icon: 'fact_check', link: '/app/criterios'},
        {label: 'Resultados', icon: 'leaderboard', link: '/app/resultados', keywords: 'votos ranking'},
        {label: 'Monitor de avaliações', icon: 'monitoring', link: '/app/monitor-avaliacoes'},
        {label: 'Equipa', icon: 'groups', link: '/app/equipa', keywords: 'membros'},
        {label: 'Finanças', icon: 'account_balance_wallet', link: '/app/financas', keywords: 'dinheiro receitas despesas'},
        {label: 'Relatórios', icon: 'analytics', link: '/app/relatorios-eventos'}
      ]});
      groups.push({title: 'Comunicação', items: [
        {label: 'Conteúdo público', icon: 'web', link: '/app/conteudo-landing', keywords: 'landing site'},
        {label: 'Marketing', icon: 'campaign', link: '/app/marketing', keywords: 'redes sociais'},
        {label: 'Comunicação', icon: 'forum', link: '/app/comunicacoes', keywords: 'email mensagens'}
      ]});
    }

    if (a.isAdmin()) {
      groups.push({title: 'Administração', items: [
        {label: 'Utilizadores', icon: 'manage_accounts', link: '/app/administracao', keywords: 'contas'},
        {label: 'Cargos internos', icon: 'badge', link: '/app/cargos-internos'},
        {label: 'Histórico', icon: 'history', link: '/app/auditoria', keywords: 'auditoria logs'},
        {label: 'Aparência', icon: 'palette', link: '/app/configuracoes', keywords: 'tema cores configuracoes'}
      ]});
    }

    groups.push({title: 'Conta', items: [
      {label: 'Meu perfil', icon: 'person', link: '/app/perfil', keywords: 'dados password'},
      {label: 'Notificações', icon: 'notifications', link: '/app/notificacoes', badge: true}
    ]});

    return groups.filter(g => g.items.length > 0);
  });

  private readonly flat = computed<SearchHit[]>(() =>
    this.groups().flatMap(g => g.items.map(i => ({...i, group: g.title}))));

  /** Pesquisa rápida: filtra as páginas a que o utilizador tem acesso. */
  readonly results = computed<SearchHit[]>(() => {
    const q = normalize(this.query().trim());
    const list = this.flat();
    if (!q) return list.slice(0, 7);
    return list.filter(i => normalize(`${i.label} ${i.group} ${i.keywords ?? ''}`).includes(q)).slice(0, 8);
  });

  /** Título e secção apresentados no cabeçalho (breadcrumb). */
  readonly page = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    const hit = [...this.flat()].sort((a, b) => b.link.length - a.link.length).find(i => path === i.link || path.startsWith(i.link + '/'));
    if (hit) return {title: hit.label, section: hit.group};
    const extra = Object.keys(EXTRA_TITLES).find(k => path.startsWith(k));
    return extra ? EXTRA_TITLES[extra] : {title: 'CLC Home', section: 'Plataforma'};
  });

  readonly initial = computed(() => (this.auth.user()?.email?.charAt(0) ?? '?').toUpperCase());
  readonly displayName = computed(() => {
    const local = (this.auth.user()?.email ?? '').split('@')[0].replace(/[._-]+/g, ' ').trim();
    return local ? local.replace(/\b\w/g, c => c.toUpperCase()) : 'Utilizador';
  });
  readonly roleLabel = computed(() => ROLE_LABELS[this.auth.user()?.role ?? ''] ?? 'Utilizador');
  readonly latest = computed(() => this.notifications.items().slice(0, 4));

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(e => {
      this.url.set((e as NavigationEnd).urlAfterRedirects);
      this.menuOpen.set(false);
      this.closeOverlays();
    });
  }

  toggleTheme() {
    const settings = this.theme.load();
    settings.mode = this.dark() ? 'light' : 'dark';
    this.theme.save(settings);
    this.dark.set(!this.dark());
  }

  toggleCompact() {
    const settings = this.theme.load();
    settings.compact = !this.compact();
    this.theme.save(settings);
    this.compact.set(settings.compact);
  }

  toggleDropdown(name: 'notif' | 'user') {
    this.searchOpen.set(false);
    this.dropdown.set(this.dropdown() === name ? '' : name);
  }

  iconFor(tipo: AppNotification['tipo']) {
    return tipo === 'SUCESSO' ? 'check_circle' : tipo === 'ALERTA' ? 'warning' : 'notifications';
  }

  openNotification(n: AppNotification) {
    this.notifications.markAsRead(n.id);
  }

  /* ----- pesquisa rápida ----- */
  onSearch(value: string) {
    this.query.set(value);
    this.activeIndex.set(0);
    this.searchOpen.set(true);
    this.dropdown.set('');
  }

  onSearchKey(e: KeyboardEvent) {
    const total = this.results().length;
    if (e.key === 'ArrowDown') {e.preventDefault(); this.activeIndex.set((this.activeIndex() + 1) % Math.max(total, 1));}
    else if (e.key === 'ArrowUp') {e.preventDefault(); this.activeIndex.set((this.activeIndex() - 1 + total) % Math.max(total, 1));}
    else if (e.key === 'Enter') {const hit = this.results()[this.activeIndex()]; if (hit) this.go(hit);}
  }

  go(item: NavItem) {
    void this.router.navigateByUrl(item.link);
    this.closeOverlays();
    this.searchInput?.nativeElement.blur();
  }

  closeOverlays() {
    this.dropdown.set('');
    this.searchOpen.set(false);
    this.query.set('');
    this.activeIndex.set(0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement | null)?.closest('[data-dd]')) {
      this.dropdown.set('');
      this.searchOpen.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' || (!typing && e.key === '/')) {
      e.preventDefault();
      this.searchInput?.nativeElement.focus();
      this.searchOpen.set(true);
      this.dropdown.set('');
    } else if (e.key === 'Escape') {
      this.closeOverlays();
      this.menuOpen.set(false);
      this.searchInput?.nativeElement.blur();
    }
  }
}
