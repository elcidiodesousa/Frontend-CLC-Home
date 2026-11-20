import {Component, OnInit, computed, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {finalize} from 'rxjs';
import {AdminService, AdminSummary, AdminUser, Cargo, StaffCargoResponse, UserRole} from '../core/admin.service';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe, MatIconModule],
  template: `
  <section class="heading">
    <div><span>Administração</span><h1>Utilizadores e permissões</h1><p>Crie contas internas, defina perfis e atribua cargos no CLC Home.</p></div>
    <button class="refresh" (click)="loadAll()"><mat-icon>refresh</mat-icon>Actualizar</button>
  </section>

  <section class="summary">
    @for(card of cards(); track card.label) {
      <article><div class="icon"><mat-icon>{{card.icon}}</mat-icon></div><div><strong>{{card.value}}</strong><span>{{card.label}}</span></div></article>
    }
  </section>

  @if(error()) { <div class="callout callout-error" role="alert"><mat-icon>warning</mat-icon>{{error()}}</div> }
  @if(success()) { <div class="callout callout-success"><mat-icon>check_circle</mat-icon>{{success()}}</div> }

  <section class="tabs">
    <button [class.active]="tab()==='users'" (click)="tab.set('users')">Utilizadores</button>
    <button [class.active]="tab()==='new'" (click)="tab.set('new')">Novo utilizador interno</button>
    <button [class.active]="tab()==='cargos'" (click)="tab.set('cargos')">Cargos internos</button>
  </section>

  @if(tab()==='users') {
    <section class="panel">
      <div class="toolbar">
        <div class="search"><mat-icon>search</mat-icon><input [(ngModel)]="query" placeholder="Pesquisar por nome ou email"></div>
        <select [(ngModel)]="roleFilter">
          <option value="">Todos os perfis</option>
          @for(role of roles; track role) { <option [value]="role">{{role}}</option> }
        </select>
      </div>
      <div class="table head"><span>Utilizador</span><span>Contacto</span><span>Província</span><span>Perfil</span><span>Registo</span></div>
      @if(loading()) { <div class="empty">A carregar utilizadores...</div> }
      @else if(filteredUsers().length===0) { <div class="empty">Nenhum utilizador encontrado.</div> }
      @else {
        @for(user of filteredUsers(); track user.id) {
          <div class="table row">
            <div class="user"><div class="avatar">{{user.nome.charAt(0).toUpperCase()}}</div><div><strong>{{user.nome}}</strong><small>{{user.email}}</small></div></div>
            <span>{{user.telefone || '—'}}</span><span>{{user.provincia || '—'}}</span>
            <select [ngModel]="user.role" (ngModelChange)="changeRole(user,$event)" [disabled]="savingId()===user.id">
              @for(role of roles; track role) { <option [value]="role">{{role}}</option> }
            </select>
            <span>{{user.criadoEm ? (user.criadoEm | date:'dd/MM/yyyy') : '—'}}</span>
          </div>
        }
      }
    </section>
  } @else if(tab()==='new') {
    <section class="create-layout">
      <form class="create-card" (ngSubmit)="createInternalUser()">
        <div class="form-title"><span class="eyebrow">Conta institucional</span><h2>Adicionar utilizador interno</h2><p>O administrador define o acesso e o cargo no momento do cadastro.</p></div>
        <div class="form-grid">
          <label>Nome completo<input [(ngModel)]="newUser.nome" name="nome" required placeholder="Nome do colaborador"></label>
          <label>E-mail institucional<input [(ngModel)]="newUser.email" name="email" required type="email" placeholder="nome@empresa.co.mz"></label>
          <label>Telefone<input [(ngModel)]="newUser.telefone" name="telefone" placeholder="+258 ..."></label>
          <label>Província<input [(ngModel)]="newUser.provincia" name="provincia" placeholder="Maputo"></label>
          <label>Perfil de acesso<select [(ngModel)]="newUser.role" name="role" required (ngModelChange)="onInternalRoleChange()"><option value="STAFF">STAFF</option><option value="ADMIN">ADMIN</option><option value="JURADO">JURADO</option></select></label>
          <label>Cargo interno<select [(ngModel)]="newUser.cargo" name="cargo" [disabled]="newUser.role==='JURADO'"><option [ngValue]="null">Sem cargo</option>@for(cargo of cargos; track cargo){<option [ngValue]="cargo">{{cargo}}</option>}</select></label>
          <label class="full">Palavra-passe temporária<input [(ngModel)]="newUser.password" name="password" required minlength="8" type="password" placeholder="Mínimo de 8 caracteres"></label>
        </div>
        <div class="hint"><mat-icon>info</mat-icon><span>Perfis STAFF e ADMIN podem receber cargo interno. O perfil JURADO terá acesso apenas às avaliações atribuídas.</span></div>
        <button class="primary" type="submit" [disabled]="creatingUser()"><mat-icon>person_add</mat-icon>{{creatingUser()?'A criar conta...':'Criar utilizador interno'}}</button>
      </form>
    </section>
  } @else {
    <section class="cargo-layout">
      <form class="assign-card" (ngSubmit)="assignCargo()">
        <span class="eyebrow">Nova atribuição</span><h2>Atribuir cargo interno</h2>
        <label>Utilizador interno<select [(ngModel)]="cargoForm.staffId" name="staffId" required><option value="">Seleccione</option>@for(user of internalStaff(); track user.id){<option [value]="user.id">{{user.nome}} — {{user.role}}</option>}</select></label>
        <label>Cargo<select [(ngModel)]="cargoForm.cargo" name="cargo" required>@for(cargo of cargos; track cargo) { <option [value]="cargo">{{cargo}}</option> }</select></label>
        <label>UUID do evento <small>(opcional)</small><input [(ngModel)]="cargoForm.eventoId" name="eventoId" placeholder="Cargo global se ficar vazio"></label>
        <button type="submit" [disabled]="savingCargo()"><mat-icon>add</mat-icon>{{savingCargo()?'A guardar...':'Atribuir cargo'}}</button>
      </form>
      <section class="panel cargos">
        <div class="panel-title"><div><h2>Cargos atribuídos</h2><p>Responsabilidades internas registadas</p></div></div>
        @if(cargosList().length===0) { <div class="empty">Ainda não existem cargos atribuídos.</div> }
        @else { @for(item of cargosList(); track item.id) {
          <article class="cargo-row"><div class="cargo-icon"><mat-icon>badge</mat-icon></div><div><strong>{{item.staffNome}}</strong><small>{{item.cargo}}</small></div><span>{{item.eventoTitulo || 'Cargo global'}}</span><button (click)="removeCargo(item)" type="button" title="Remover cargo"><mat-icon>delete_outline</mat-icon></button></article>
        } }
      </section>
    </section>
  }
  `,
  styles: [`
  .heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.heading>div>span,.eyebrow{color:var(--primary);text-transform:uppercase;letter-spacing:.13em;font-size:.7rem;font-weight:800}h1{color:var(--text);margin:6px 0}.heading p{color:var(--muted);margin:0}.refresh,.assign-card button,.primary{display:flex;align-items:center;justify-content:center;gap:8px;border:0;padding:12px 16px;border-radius:11px;background:linear-gradient(90deg,var(--primary),var(--primary-2));color:#fff;font-weight:800;cursor:pointer}.summary{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px}.summary article{display:flex;align-items:center;gap:13px;background:var(--surface);border-radius:15px;padding:18px;box-shadow:0 8px 28px #1419460d}.summary .icon{width:45px;height:45px;border-radius:13px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)}.summary article>div:last-child{display:flex;flex-direction:column}.summary strong{font-size:1.35rem;color:var(--text)}.summary span{font-size:.76rem;color:var(--muted)}.alert,.success{display:flex;align-items:center;gap:9px;padding:13px;border-radius:11px;margin-bottom:16px}.alert{background:var(--danger-soft);color:var(--danger-ink)}.success{background:var(--success-soft);color:var(--success-ink)}.tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}.tabs button{border:0;background:var(--surface);color:var(--muted);padding:11px 17px;border-radius:10px;font-weight:800;cursor:pointer}.tabs button.active{background:var(--ink);color:#fff}.panel,.assign-card,.create-card{background:var(--surface);border-radius:16px;box-shadow:0 8px 28px #1419460d}.toolbar{display:flex;justify-content:space-between;gap:12px;padding:15px}.search{display:flex;align-items:center;gap:9px;flex:1;max-width:440px;border:1px solid var(--line);border-radius:10px;padding:0 12px}.search input{border:0;outline:0;min-height:43px;flex:1}.toolbar select,.table select,.assign-card select,.assign-card input,.create-card select,.create-card input{border:1px solid var(--line);border-radius:10px;min-height:43px;padding:0 12px;background:var(--surface)}.table{display:grid;grid-template-columns:1.6fr .8fr .7fr .75fr .65fr;gap:14px;align-items:center;padding:14px 20px}.head{background:var(--surface-soft);color:var(--muted);text-transform:uppercase;font-size:.68rem;font-weight:800}.row{border-top:1px solid var(--line);color:var(--text);font-size:.8rem}.user{display:flex;align-items:center;gap:11px}.avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:800}.user>div:last-child{display:flex;flex-direction:column}.user strong{color:var(--text)}.user small{color:var(--muted);margin-top:3px}.empty{text-align:center;padding:42px;color:var(--muted)}.create-layout{display:grid;place-items:start center}.create-card{width:min(100%,850px);padding:28px}.form-title h2{color:var(--text);margin:7px 0}.form-title p{color:var(--muted);margin:0 0 22px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.create-card label,.assign-card label{display:grid;gap:7px;color:var(--text);font-size:.82rem;font-weight:800}.form-grid .full{grid-column:1/-1}.hint{display:flex;gap:9px;align-items:flex-start;background:var(--primary-soft);color:var(--primary-dark);padding:12px;border-radius:10px;margin:16px 0;font-size:.78rem}.primary{width:100%}.primary:disabled,.assign-card button:disabled{opacity:.65;cursor:not-allowed}.cargo-layout{display:grid;grid-template-columns:340px 1fr;gap:18px}.assign-card{padding:22px;height:max-content}.assign-card h2{color:var(--text);margin:8px 0 20px}.assign-card label{margin-bottom:14px}.assign-card label small{font-weight:500;color:var(--muted)}.assign-card input,.assign-card select{width:100%}.assign-card button{width:100%;margin-top:8px}.panel-title{padding:20px}.panel-title h2{margin:0;color:var(--text);font-size:1rem}.panel-title p{margin:4px 0 0;color:var(--muted);font-size:.72rem}.cargo-row{display:grid;grid-template-columns:44px 1fr .8fr 40px;gap:12px;align-items:center;padding:14px 20px;border-top:1px solid var(--line)}.cargo-icon{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)}.cargo-row>div:nth-child(2){display:flex;flex-direction:column}.cargo-row strong{color:var(--text)}.cargo-row small,.cargo-row>span{color:var(--muted);font-size:.72rem;margin-top:3px}.cargo-row button{border:0;background:transparent;color:var(--danger-ink);cursor:pointer}@media(max-width:1100px){.summary{grid-template-columns:repeat(3,1fr)}.cargo-layout{grid-template-columns:1fr}}@media(max-width:780px){.summary{grid-template-columns:1fr 1fr}.head{display:none}.table.row{grid-template-columns:1fr auto}.table.row>span{display:none}.heading .refresh{display:none}.toolbar{flex-direction:column}.search{max-width:none}.form-grid{grid-template-columns:1fr}.form-grid .full{grid-column:auto}}
  `]
})
export class AdminComponent implements OnInit {
  readonly roles: UserRole[] = ['VISITANTE','PARTICIPANTE','JURADO','STAFF','ADMIN'];
  readonly cargos: Cargo[] = ['PRESIDENTE','VICE_PRESIDENTE','COORDENADOR','TESOUREIRO','ORGANIZADOR'];
  readonly users = signal<AdminUser[]>([]);
  readonly cargosList = signal<StaffCargoResponse[]>([]);
  readonly summary = signal<AdminSummary>({utilizadores:0,participantes:0,jurados:0,staff:0,administradores:0});
  readonly loading = signal(true); readonly error = signal(''); readonly success = signal('');
  readonly savingId = signal(''); readonly savingCargo = signal(false); readonly creatingUser = signal(false);
  readonly tab = signal<'users'|'new'|'cargos'>('users');
  query = ''; roleFilter = '';
  cargoForm: {staffId:string; cargo:Cargo; eventoId:string} = {staffId:'',cargo:'ORGANIZADOR',eventoId:''};
  newUser: {nome:string;email:string;password:string;telefone:string;provincia:string;role:'ADMIN'|'STAFF'|'JURADO';cargo:Cargo|null} = {nome:'',email:'',password:'',telefone:'',provincia:'',role:'STAFF',cargo:'ORGANIZADOR'};

  readonly filteredUsers = computed(() => { const q=this.query.trim().toLowerCase(); return this.users().filter(u=>(!this.roleFilter||u.role===this.roleFilter)&&(!q||u.nome.toLowerCase().includes(q)||u.email.toLowerCase().includes(q))); });
  readonly internalStaff = computed(() => this.users().filter(u=>u.role==='STAFF'||u.role==='ADMIN'));
  readonly cards = computed(() => [
    {label:'Utilizadores',value:this.summary().utilizadores,icon:'people'},{label:'Participantes',value:this.summary().participantes,icon:'how_to_reg'},{label:'Jurados',value:this.summary().jurados,icon:'gavel'},{label:'Staff',value:this.summary().staff,icon:'groups'},{label:'Administradores',value:this.summary().administradores,icon:'admin_panel_settings'}
  ]);

  constructor(private readonly admin: AdminService) {}
  ngOnInit(): void { this.loadAll(); }
  loadAll(): void { this.loading.set(true); this.error.set(''); this.admin.listUsers().pipe(finalize(()=>this.loading.set(false))).subscribe({next:users=>{this.users.set(users);this.deriveSummary(users)},error:(e:Error)=>this.error.set(e.message)}); this.admin.listStaffCargos().subscribe({next:v=>this.cargosList.set(v),error:()=>{}}); this.admin.summary().subscribe({next:v=>this.summary.set(v),error:()=>{}}); }
  onInternalRoleChange(): void { if(this.newUser.role==='JURADO') this.newUser.cargo=null; }
  createInternalUser(): void {
    this.error.set(''); this.success.set('');
    if(!this.newUser.nome.trim()||!this.newUser.email.trim()||this.newUser.password.length<8){this.error.set('Preencha nome, e-mail e uma palavra-passe com pelo menos 8 caracteres.');return;}
    this.creatingUser.set(true);
    this.admin.createInternalUser({...this.newUser,email:this.newUser.email.trim(),nome:this.newUser.nome.trim(),telefone:this.newUser.telefone.trim()||undefined,provincia:this.newUser.provincia.trim()||undefined}).pipe(finalize(()=>this.creatingUser.set(false))).subscribe({
      next:response=>{this.users.update(list=>[response.utilizador,...list]);if(response.cargo)this.cargosList.update(list=>[response.cargo!,...list]);this.deriveSummary(this.users());this.success.set(`Utilizador ${response.utilizador.nome} criado com perfil ${response.utilizador.role}.`);this.newUser={nome:'',email:'',password:'',telefone:'',provincia:'',role:'STAFF',cargo:'ORGANIZADOR'};},
      error:(e:Error)=>this.error.set(e.message)
    });
  }
  changeRole(user:AdminUser,role:UserRole):void{if(role===user.role)return;this.savingId.set(user.id);this.admin.updateRole(user.id,role).pipe(finalize(()=>this.savingId.set(''))).subscribe({next:u=>{this.users.update(list=>list.map(i=>i.id===u.id?u:i));this.deriveSummary(this.users())},error:(e:Error)=>this.error.set(e.message)});}
  assignCargo():void{if(!this.cargoForm.staffId)return;this.savingCargo.set(true);this.admin.assignCargo({staffId:this.cargoForm.staffId,cargo:this.cargoForm.cargo,eventoId:this.cargoForm.eventoId||null}).pipe(finalize(()=>this.savingCargo.set(false))).subscribe({next:item=>{this.cargosList.update(list=>[item,...list]);this.cargoForm={staffId:'',cargo:'ORGANIZADOR',eventoId:''};this.success.set('Cargo atribuído com sucesso.')},error:(e:Error)=>this.error.set(e.message)});}
  removeCargo(item:StaffCargoResponse):void{if(!confirm(`Remover o cargo ${item.cargo} de ${item.staffNome}?`))return;this.admin.removeCargo(item.id).subscribe({next:()=>this.cargosList.update(list=>list.filter(x=>x.id!==item.id)),error:(e:Error)=>this.error.set(e.message)});}
  private deriveSummary(users:AdminUser[]):void{this.summary.set({utilizadores:users.length,participantes:users.filter(u=>u.role==='PARTICIPANTE').length,jurados:users.filter(u=>u.role==='JURADO').length,staff:users.filter(u=>u.role==='STAFF').length,administradores:users.filter(u=>u.role==='ADMIN').length});}
}
