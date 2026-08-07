import {Component,OnInit,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {CertificateService} from '../core/certificate.service';
import {AuthService} from '../core/auth.service';
import {EventService,Evento} from '../core/event.service';
import {RegistrationService,Inscricao} from '../core/registration.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `<section class="page">
    <header>
      <div>
        <span>CERTIFICAÇÃO DIGITAL</span>
        <h1>Certificados Premium</h1>
        <p>Documentos elegantes, assinados eletronicamente e verificáveis por QR Code.</p>
      </div>
      <button *ngIf="auth.isStaff()" (click)="show=!show"><mat-icon>workspace_premium</mat-icon> Emitir certificado</button>
    </header>

    <form *ngIf="show" (ngSubmit)="emitir()" class="panel form">
      <div class="link">
        <select [(ngModel)]="form.eventoId" name="evento" (ngModelChange)="onEventoChange()">
          <option [ngValue]="undefined">Sem evento associado</option>
          <option *ngFor="let e of eventos" [ngValue]="e.id">{{e.titulo}}</option>
        </select>
        <select [(ngModel)]="participanteSelecionado" name="participante" [disabled]="!form.eventoId" (ngModelChange)="onParticipanteChange()">
          <option [ngValue]="undefined">Preencher nome manualmente</option>
          <option *ngFor="let i of inscricoes" [ngValue]="i">{{i.participanteNome}}</option>
        </select>
      </div>
      <small class="hint">Ao escolher um participante inscrito, o certificado fica ligado a ele e passa a aparecer na área "Meus certificados" dele. Sem essa ligação, o certificado só fica visível aqui, na lista de STAFF/ADMIN.</small>

      <input [(ngModel)]="form.nomeBeneficiario" name="nome" placeholder="Nome completo" required>
      <input [(ngModel)]="form.emailBeneficiario" name="email" placeholder="E-mail">
      <select [(ngModel)]="form.tipoCertificado" name="tipo">
        <option value="PARTICIPACAO">Participação</option>
        <option value="ORGANIZACAO">Organização</option>
        <option value="JURI">Júri</option>
        <option value="PALESTRANTE">Palestrante</option>
        <option value="VENCEDOR">Vencedor</option>
        <option value="HONRA_AO_MERITO">Honra ao Mérito</option>
      </select>
      <input [(ngModel)]="form.titulo" name="titulo" placeholder="Texto principal do reconhecimento" required>
      <input [(ngModel)]="form.categoria" name="cat" placeholder="Categoria">
      <input [(ngModel)]="form.modalidade" name="mod" placeholder="Modalidade">
      <input [(ngModel)]="form.classificacao" name="class" placeholder="Classificação">
      <input [(ngModel)]="form.cargaHoraria" name="horas" type="number" placeholder="Carga horária">
      <textarea [(ngModel)]="form.observacao" name="obs" placeholder="Observação"></textarea>
      <div class="signature" *ngFor="let a of form.assinaturas;let i=index">
        <input [(ngModel)]="a.nome" [name]="'sn'+i" placeholder="Nome do signatário">
        <input [(ngModel)]="a.cargo" [name]="'sc'+i" placeholder="Cargo">
        <button type="button" class="danger" (click)="form.assinaturas.splice(i,1)"><mat-icon>delete</mat-icon></button>
      </div>
      <div class="actions">
        <button type="button" class="ghost" (click)="addSign()"><mat-icon>draw</mat-icon> Adicionar assinatura</button>
        <button>Gerar certificado premium</button>
      </div>
    </form>

    <div class="grid">
      <article *ngFor="let c of items" class="card">
        <div class="medal"><mat-icon>verified</mat-icon></div>
        <div>
          <b>{{c.nomeBeneficiario}}</b>
          <p>{{c.titulo}}</p>
          <small>{{c.tipoCertificado?.replaceAll('_',' ')}} · {{c.codigoValidacao}}</small>
          <small *ngIf="c.seloDigital">{{c.seloDigital}}</small>
        </div>
        <button class="ghost" (click)="baixar(c)"><mat-icon>download</mat-icon></button>
      </article>
      <div class="empty" *ngIf="!items.length">Ainda não existem certificados.</div>
    </div>
  </section>`,
  styles: [`.page{display:grid;gap:20px}header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}header span{font-size:.68rem;font-weight:900;letter-spacing:.14em;color:var(--primary)}h1{margin:5px 0}p,small{color:var(--muted)}button{display:inline-flex;align-items:center;gap:7px;border:0;border-radius:11px;padding:11px 15px;background:var(--primary);color:white;font-weight:800;cursor:pointer}.panel,.card{background:var(--surface);border:1px solid var(--line);border-radius:16px}.form{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:18px}.form textarea{grid-column:1/-1;min-height:75px}.form input,.form select,.form textarea{padding:11px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text)}.link{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px}.hint{grid-column:1/-1;margin-top:-6px}.signature{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr auto;gap:10px}.actions{grid-column:1/-1;display:flex;justify-content:space-between}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:14px}.card{display:grid;grid-template-columns:52px 1fr 40px;gap:12px;align-items:center;padding:16px}.medal{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#6d49b8,#b28bff);color:white;display:grid;place-items:center}.card p{margin:5px 0;font-size:.8rem}.card small{display:block}.ghost{background:transparent;color:var(--primary)}.danger{background:#fee2e2;color:#b91c1c;padding:8px}.empty{padding:35px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:16px}@media(max-width:850px){header{flex-direction:column}.form{grid-template-columns:1fr}.link{grid-template-columns:1fr}.signature{grid-template-columns:1fr}.actions{flex-direction:column;gap:10px}}`]
})
export class CertificatesComponent implements OnInit {
  private s = inject(CertificateService);
  private eventService = inject(EventService);
  private registrationService = inject(RegistrationService);
  auth = inject(AuthService);
  items: any[] = [];
  show = false;
  eventos: Evento[] = [];
  inscricoes: Inscricao[] = [];
  participanteSelecionado?: Inscricao;
  form: any = { tipoCertificado: 'PARTICIPACAO', assinaturas: [] };

  ngOnInit() {
    this.load();
    if (this.auth.isStaff()) {
      this.eventService.todos().subscribe({ next: r => this.eventos = r });
    }
  }

  load() {
    (this.auth.isStaff() ? this.s.listar() : this.s.meus()).subscribe({ next: r => this.items = r });
  }

  onEventoChange() {
    this.participanteSelecionado = undefined;
    this.form.utilizadorId = undefined;
    this.inscricoes = [];
    if (!this.form.eventoId) return;
    this.registrationService.porEvento(this.form.eventoId).subscribe({
      next: r => this.inscricoes = r.filter(i => i.estado === 'APROVADA')
    });
  }

  onParticipanteChange() {
    if (this.participanteSelecionado) {
      this.form.utilizadorId = this.participanteSelecionado.participanteId;
      this.form.nomeBeneficiario = this.participanteSelecionado.participanteNome;
    } else {
      this.form.utilizadorId = undefined;
    }
  }

  addSign() {
    this.form.assinaturas.push({ ordemExibicao: this.form.assinaturas.length + 1 });
  }

  emitir() {
    const obs = { ...this.form };
    (this.s as any).premium(obs).subscribe(() => {
      this.form = { tipoCertificado: 'PARTICIPACAO', assinaturas: [] };
      this.participanteSelecionado = undefined;
      this.inscricoes = [];
      this.show = false;
      this.load();
    });
  }

  baixar(c: any) {
    this.s.pdf(c.id).subscribe(b => {
      const u = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = u;
      a.download = `certificado-${c.codigoValidacao}.pdf`;
      a.click();
      URL.revokeObjectURL(u);
    });
  }
}
