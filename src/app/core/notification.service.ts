import {Injectable, computed, signal} from '@angular/core';

export interface AppNotification {
  id:string; titulo:string; mensagem:string; data:string; lida:boolean;
  tipo:'INFO'|'SUCESSO'|'ALERTA';
}

@Injectable({providedIn:'root'})
export class NotificationService {
  private readonly storageKey='clc_notifications';
  private readonly itemsSignal=signal<AppNotification[]>(this.load());
  readonly items=computed(()=>this.itemsSignal());
  readonly unread=computed(()=>this.itemsSignal().filter(n=>!n.lida).length);
  markAsRead(id:string){this.itemsSignal.update(items=>items.map(item=>item.id===id?{...item,lida:true}:item));this.persist()}
  markAllAsRead(){this.itemsSignal.update(items=>items.map(item=>({...item,lida:true})));this.persist()}
  add(notification:Omit<AppNotification,'id'|'data'|'lida'>){this.itemsSignal.update(items=>[{...notification,id:crypto.randomUUID(),data:new Date().toISOString(),lida:false},...items]);this.persist()}
  private load():AppNotification[]{
    try{const stored=localStorage.getItem(this.storageKey);if(stored){const parsed=JSON.parse(stored) as AppNotification[];return parsed.filter(n=>!/(API|backend|JWT|servidor)/i.test(`${n.titulo} ${n.mensagem}`));}}catch{}
    return [
      {id:'1',titulo:'Bem-vindo ao CLC Home',mensagem:'Explore os eventos disponíveis e acompanhe as suas participações num só lugar.',data:new Date().toISOString(),lida:false,tipo:'SUCESSO'},
      {id:'2',titulo:'Descubra novos eventos',mensagem:'Consulte a agenda e reserve o seu lugar nas experiências que mais combinam consigo.',data:new Date(Date.now()-3600000).toISOString(),lida:false,tipo:'INFO'},
      {id:'3',titulo:'Mantenha o perfil actualizado',mensagem:'Dados correctos facilitam inscrições, pagamentos e emissão de bilhetes.',data:new Date(Date.now()-7200000).toISOString(),lida:true,tipo:'INFO'}
    ];
  }
  private persist(){localStorage.setItem(this.storageKey,JSON.stringify(this.itemsSignal()))}
}
