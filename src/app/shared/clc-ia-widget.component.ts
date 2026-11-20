import {Component, ElementRef, ViewChild, computed, effect, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ClcIaService} from '../core/clc-ia.service';
import {AuthService} from '../core/auth.service';

interface Parte {t: string; b: boolean}
type Bloco = {tipo: 'p'; partes: Parte[]} | {tipo: 'ul'; itens: Parte[][]};
interface Msg {autor: 'user' | 'ai'; texto: string; hora: Date; blocos: Bloco[]; sugestoes?: string[]; erro?: boolean}

/** Divide uma linha em partes normais e **negrito** (sem usar innerHTML). */
const partes = (linha: string): Parte[] =>
  linha.split(/\*\*(.+?)\*\*/g).map((t, i) => ({t, b: i % 2 === 1})).filter(p => p.t.length > 0);

/** Converte o texto da IA em parágrafos e listas, de forma segura. */
const blocos = (texto: string): Bloco[] => {
  const out: Bloco[] = [];
  for (const linha of texto.split('\n')) {
    const l = linha.trim();
    if (!l) continue;
    const item = /^([-•*]|\d+[.)])\s+(.*)$/.exec(l);
    if (item) {
      const ultimo = out[out.length - 1];
      if (ultimo?.tipo === 'ul') ultimo.itens.push(partes(item[2]));
      else out.push({tipo: 'ul', itens: [partes(item[2])]});
    } else {
      out.push({tipo: 'p', partes: partes(l)});
    }
  }
  return out;
};

const msg = (autor: Msg['autor'], texto: string, extra: Partial<Msg> = {}): Msg =>
  ({autor, texto, hora: new Date(), blocos: autor === 'ai' ? blocos(texto) : [], ...extra});

@Component({
  selector: 'app-clc-ia-widget',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe],
  templateUrl: './clc-ia-widget.component.html',
  styleUrl: './clc-ia-widget.component.scss'
})
export class ClcIaWidgetComponent {
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  aberto = signal(false);
  carregando = signal(false);
  copiado = signal<number | null>(null);
  texto = '';

  private identidadeAnterior = '';
  readonly identidade = computed(() => this.auth.user()?.email ?? 'publico');
  readonly subtitulo = computed(() => this.auth.logged() ? 'Sessão autenticada' : 'Acesso público');
  readonly placeholder = computed(() => this.auth.logged() ? 'Pergunte sobre a sua conta ou qualquer assunto…' : 'Pergunte sobre eventos ou qualquer assunto…');

  sessaoId: string | null = null;
  mensagens = signal<Msg[]>([]);

  constructor(private ia: ClcIaService, public auth: AuthService) {
    effect(() => {
      const identidade = this.identidade();
      if (identidade === this.identidadeAnterior) return;
      this.identidadeAnterior = identidade;
      this.sessaoId = localStorage.getItem(this.chaveSessao(identidade));
      this.mensagens.set([this.boasVindas()]);
    });
  }

  private chaveSessao(identidade: string) { return `clc_ia_sessao_${identidade}`; }

  private boasVindas(): Msg {
    if (this.auth.logged()) {
      return msg('ai', 'Olá! Sou a CLC IA. Posso responder perguntas gerais e ajudar com informações autorizadas da tua conta no CLC Home. Como posso ajudar?',
        {sugestoes: ['Os meus eventos', 'Estado das minhas inscrições', 'Os meus bilhetes']});
    }
    return msg('ai', 'Olá! Sou a CLC IA, assistente do CLC Home. Posso ajudar a encontrar eventos, explicar inscrições e bilhetes ou responder a perguntas gerais.',
      {sugestoes: ['Ver eventos publicados', 'Como me inscrever?', 'Como comprar bilhete?']});
  }

  alternar() {
    this.aberto.set(!this.aberto());
    if (this.aberto()) this.descer();
  }

  novaConversa() {
    localStorage.removeItem(this.chaveSessao(this.identidade()));
    this.sessaoId = null;
    this.mensagens.set([this.boasVindas()]);
  }

  copiar(m: Msg, i: number) {
    navigator.clipboard?.writeText(m.texto).then(() => {
      this.copiado.set(i);
      setTimeout(() => this.copiado.set(null), 1800);
    });
  }

  enviarSugestao(s: string) { this.texto = s; this.enviar(); }

  /** Volta a enviar a última pergunta depois de um erro. */
  repetir() {
    const todas = this.mensagens();
    const idx = todas.map(m => m.autor).lastIndexOf('user');
    if (idx < 0) return;
    const ultima = todas[idx];
    this.mensagens.set(todas.slice(0, idx));
    this.texto = ultima.texto;
    this.enviar();
  }

  enviar() {
    const texto = this.texto.trim();
    if (!texto || this.carregando()) return;
    this.mensagens.update(v => [...v, msg('user', texto)]);
    this.texto = '';
    this.carregando.set(true);
    this.descer();

    this.ia.conversar(texto, this.sessaoId).subscribe({
      next: r => {
        this.sessaoId = r.sessaoId;
        localStorage.setItem(this.chaveSessao(this.identidade()), r.sessaoId);
        this.mensagens.update(v => [...v, msg('ai', r.resposta, {sugestoes: r.sugestoes})]);
        this.carregando.set(false);
        this.descer();
      },
      error: err => {
        const detalhe = err?.error?.message || err?.error?.detail;
        this.mensagens.update(v => [...v, msg('ai',
          detalhe ? `Estou com dificuldade para consultar o sistema agora: ${detalhe}. Tenta novamente.`
                  : 'Estou com dificuldade para responder neste momento. Tenta novamente ou reformula a pergunta.', {erro: true})]);
        this.carregando.set(false);
        this.descer();
      }
    });
  }

  private descer() {
    setTimeout(() => this.scroller?.nativeElement.scrollTo({top: this.scroller.nativeElement.scrollHeight, behavior: 'smooth'}), 40);
  }
}
