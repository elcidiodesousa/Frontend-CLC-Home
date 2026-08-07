import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


export interface Categoria {
  id:string;
  nome:string;
  limiteParticipantes:number;
  eventoId:string;
  eventoTitulo:string;
}


export interface CategoriaRequest {
  nome:string;
  limiteParticipantes:number;
  eventoId:string;
}


@Injectable({
  providedIn:'root'
})
export class CategoryService {


  constructor(
    private http:HttpClient
  ){}



  listar(eventoId:string){

    return this.http.get<Categoria[]>(
      environment.apiUrl+'/categorias/evento/'+eventoId
    );

  }



  porEvento(eventoId:string){

    return this.http.get<Categoria[]>(
      environment.apiUrl+'/categorias/evento/'+eventoId
    );

  }



  criar(b:CategoriaRequest){

    return this.http.post<Categoria>(
      environment.apiUrl+'/categorias',
      b
    );

  }



  actualizar(id:string,b:CategoriaRequest){

    return this.http.put<Categoria>(
      environment.apiUrl+'/categorias/'+id,
      b
    );

  }



  eliminar(id:string){

    return this.http.delete<void>(
      environment.apiUrl+'/categorias/'+id
    );

  }


}