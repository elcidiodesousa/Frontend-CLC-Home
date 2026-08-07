import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import {
  EventService,
  EventoResponse
} from '../core/event.service';

import {
  CandidateService,
  Candidato
} from '../core/candidate.service';

import {
  CriteriaService,
  CriterioAvaliacao
} from '../core/criteria.service';

import {
  EvaluationService,
  Avaliacao
} from '../core/evaluation.service';
import { JuryService } from '../core/jury.service';



@Component({

  standalone:true,

  imports:[
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],


  template: `


<section class="heading">

  <div>

    <span>
      Área do jurado
    </span>


    <h1>
      Avaliações
    </h1>


    <p>
      Atribua notas aos candidatos de acordo com os critérios definidos.
    </p>


  </div>


</section>




<div 
class="notice"
*ngIf="erro()">

{{erro()}}

</div>






<section class="filters">


<label>

Evento


<select

[value]="eventoId()"

(change)="mudarEvento($any($event.target).value)"

>


<option value="">

Seleccione um evento

</option>



<option

*ngFor="let e of eventos()"

[value]="e.id"

>


{{e.titulo}}


</option>



</select>


</label>







<label>


Candidato



<select

[value]="candidatoId()"

(change)="mudarCandidato($any($event.target).value)"

>



<option value="">


Seleccione um candidato


</option>





<option

*ngFor="let c of candidatos()"

[value]="c.id"

>


{{c.nome}} — {{c.categoriaNome}}


</option>



</select>



</label>



</section>







<section

class="candidate"

*ngIf="candidatoSeleccionado() as c"

>



<div class="photo">



<img

*ngIf="c.fotoUrl"

[src]="c.fotoUrl"

[alt]="c.nome"


>



<mat-icon

*ngIf="!c.fotoUrl"

>

person

</mat-icon>



</div>





<div>


<span>

{{c.categoriaNome}}

</span>



<h2>

{{c.nome}}

</h2>




<p>

{{c.descricao || 'Sem descrição disponível'}}

</p>



</div>







<div class="score">


<small>

Média actual

</small>



<strong>

{{media() | number:'1.1-2'}}

</strong>



</div>




</section>





<section

class="criteria"

*ngIf="candidatoId()"

>


<article

*ngFor="let criterio of criterios()"

>


<div class="criterion">


<span class="icon">

<mat-icon>

star

</mat-icon>

</span>



<div>


<h3>

{{criterio.nome}}

</h3>


<p>

Peso {{criterio.peso}}%

</p>


</div>



</div>





<div

class="submitted"

*ngIf="avaliacaoDo(criterio.id) as avaliacao"

>


<mat-icon>

check_circle

</mat-icon>



<div>


<strong>

{{avaliacao.nota}}

</strong>



<small>

Nota submetida

</small>


</div>



</div>





<form

*ngIf="!avaliacaoDo(criterio.id)"

[formGroup]="forms[criterio.id]"

(ngSubmit)="avaliar(criterio)"

>


<input

type="number"

min="0"

max="20"

step="0.1"

formControlName="nota"

placeholder="0 - 20"


>



<button

type="submit"

[disabled]="savingId()===criterio.id"

>


{{savingId()===criterio.id 
? 'A guardar...' 
: 'Submeter'}}


</button>



</form>



</article>


</section>
id="parte2"
<section

class="empty"

*ngIf="!candidatoId()"

>


<mat-icon>

rate_review

</mat-icon>



<h2>

Seleccione um candidato

</h2>



<p>

{{ eventoId() && candidatos().length === 0 ? 'Ainda não existem inscrições aprovadas/candidatos disponíveis neste evento.' : 'Escolha o evento e candidato para iniciar a avaliação.' }}

</p>



</section>





`,



styles:[`

.heading{

margin-bottom:20px;

}



.heading span{

color:#6d28d9;

text-transform:uppercase;

letter-spacing:.13em;

font-size:.7rem;

font-weight:800;

}



.heading h1{

color:#11164b;

margin:6px 0;

font-size:2rem;

}



.heading p{

color:#777c94;

}





.notice{

padding:12px;

background:#fff1f0;

color:#b42318;

border-radius:10px;

margin-bottom:15px;

}





.filters{

display:grid;

grid-template-columns:1fr 1fr;

gap:15px;

background:#fff;

padding:18px;

border-radius:15px;

box-shadow:0 8px 25px rgba(0,0,0,.05);

}



.filters label{

display:grid;

gap:8px;

font-weight:700;

color:#303556;

font-size:.85rem;

}





select,
input{


padding:12px;

border:1px solid #ddd;

border-radius:10px;

font-size:.95rem;

background:white;

}





.candidate{


display:grid;

grid-template-columns:80px 1fr auto;

gap:18px;

align-items:center;

margin-top:20px;

background:linear-gradient(
120deg,
#11165b,
#43208f
);


color:white;

padding:20px;

border-radius:16px;


}




.photo{


width:80px;

height:80px;

border-radius:15px;

overflow:hidden;

display:grid;

place-items:center;

background:#ffffff22;


}



.photo img{


width:100%;

height:100%;

object-fit:cover;


}



.photo mat-icon{


font-size:45px;

width:45px;

height:45px;

color:#f6b323;


}




.candidate span{


color:#f6b323;

font-size:.7rem;

font-weight:800;

text-transform:uppercase;

letter-spacing:.1em;


}




.candidate h2{


margin:5px 0;

}



.candidate p{


color:#d7daf0;

margin:0;

}




.score{


display:flex;

flex-direction:column;

align-items:flex-end;

}



.score small{


color:#d0d4ef;

}



.score strong{


font-size:2rem;

color:#f6b323;


}







.criteria{


display:grid;

gap:15px;

margin-top:20px;


}




.criteria article{


background:white;

padding:18px;

border-radius:15px;

display:grid;

grid-template-columns:1fr auto;

gap:20px;

align-items:center;

box-shadow:0 8px 25px rgba(20,25,70,.05);


}





.criterion{


display:flex;

align-items:center;

gap:12px;


}



.criterion .icon{


width:45px;

height:45px;

display:grid;

place-items:center;

background:#f0eaff;

border-radius:12px;

color:#6d28d9;


}




.criterion h3{


margin:0;

color:#11164b;


}




.criterion p{


margin:5px 0 0;

font-size:.75rem;

color:#888;


}





.criteria form{


display:flex;

gap:10px;


}





.criteria input{


width:100px;


}





button{


background:linear-gradient(
90deg,
#6d28d9,
#7c3aed
);


color:white;

border:0;

padding:10px 15px;

border-radius:10px;

font-weight:800;

cursor:pointer;


}




button:disabled{


opacity:.6;

cursor:not-allowed;


}





.submitted{


display:flex;

align-items:center;

gap:10px;

background:#dcfce7;

color:#15803d;

padding:10px 15px;

border-radius:10px;


}



.submitted div{


display:flex;

flex-direction:column;


}



.submitted small{


font-size:.7rem;


}







.empty{


margin-top:20px;

background:white;

padding:50px;

border-radius:15px;

text-align:center;

color:#777c94;


}



.empty mat-icon{


font-size:55px;

width:55px;

height:55px;

color:#6d28d9;


}



.empty h2{


color:#11164b;

}





@media(max-width:850px){


.filters{


grid-template-columns:1fr;


}



.candidate{


grid-template-columns:70px 1fr;


}



.score{


grid-column:2;

align-items:flex-start;


}



.criteria article{


grid-template-columns:1fr;


}


}





@media(max-width:550px){



.criteria form{


flex-direction:column;


}



.criteria input{


width:100%;


}


}



`]

})
export class EvaluationsComponent implements OnInit {


  eventos = signal<EventoResponse[]>([]);

  candidatos = signal<Candidato[]>([]);


  eventoId = signal('');

  candidatoId = signal('');


  criterios = signal<CriterioAvaliacao[]>([]);

  avaliacoes = signal<Avaliacao[]>([]);


  erro = signal('');

  savingId = signal('');



  forms: Record<string, FormGroup> = {};




  constructor(

    private eventService: EventService,

    private candidateService: CandidateService,

    private criteriaService: CriteriaService,

    private evaluationService: EvaluationService,

    private juryService: JuryService,

    private fb: FormBuilder

  ){}





  ngOnInit(): void {

    this.carregarEventos();

  }







  carregarEventos(){


    this.juryService

    .meusEventos()

    .subscribe({


      next:eventos=>{


        this.eventos.set(eventos);


      },



      error:e=>{


        this.erro.set(

          e.error?.mensagem ||

          'Não foi possível carregar os eventos atribuídos ao jurado.'

        );


      }


    });



  }









  mudarEvento(id:string){


    this.erro.set('');
    this.eventoId.set(id);


    this.candidatoId.set('');

    this.candidatos.set([]);

    this.criterios.set([]);

    this.avaliacoes.set([]);

    this.forms={};



    if(!id){

      return;

    }






    this.candidateService

    .avaliaveisPorEvento(id)

    .subscribe({


      next:candidatos=>{


        this.candidatos.set(candidatos);


      },


      error:e=>{


        this.erro.set(

          e.error?.mensagem ||

          'Não foi possível carregar os candidatos/inscritos aprovados deste evento.'

        );


      }


    });



  }









  mudarCandidato(id:string){


    this.candidatoId.set(id);


    this.avaliacoes.set([]);

    this.criterios.set([]);

    this.forms={};




    if(!id){

      return;

    }






    // Carregar critérios do evento


    this.criteriaService

    .porEvento(this.eventoId())

    .subscribe({


      next:criterios=>{


        this.criterios.set(criterios);



        criterios.forEach(c=>{


          this.forms[c.id]=this.fb.group({


            nota:[

              '',

              [

                Validators.required,

                Validators.min(0),

                Validators.max(20)

              ]

            ]

          });



        });



      },



      error:e=>{


        const mensagem = e?.error?.mensagem || e?.error?.message || e?.message;

        this.erro.set(

          e?.status === 403
            ? 'O seu perfil de jurado ainda não tem acesso aos critérios deste evento. Contacte a organização e volte a iniciar sessão.'
            : (mensagem || 'Erro ao carregar critérios do evento.')

        );


      }



    });








    // Carregar avaliações existentes



    this.evaluationService

    .porCandidato(id)

    .subscribe({


      next:avaliacoes=>{


        this.avaliacoes.set(avaliacoes);


      },



      error:e=>{


        this.erro.set(

          e.error?.mensagem ||

          'Erro ao carregar avaliações'

        );


      }


    });



  }









  candidatoSeleccionado(){


    return this.candidatos()

    .find(

      c=>c.id===this.candidatoId()

    );


  }









  media(){


    const notas =

    this.avaliacoes()

    .map(

      a=>a.nota

    );



    if(notas.length===0){

      return 0;

    }




    const soma =

    notas.reduce(

      (total,nota)=>total+nota,

      0

    );



    return soma/notas.length;


  }









  avaliacaoDo(

    criterioId:string

  ){


    return this.avaliacoes()

    .find(

      a=>a.criterioId===criterioId

    );


  }









  avaliar(

    criterio:CriterioAvaliacao

  ){



    const form =

    this.forms[criterio.id];



    if(!form || form.invalid){

      return;

    }




    this.savingId.set(

      criterio.id

    );



    this.erro.set('');






    const request = {


      candidatoId:

      this.candidatoId(),



      criterioId:

      criterio.id,



      nota:

      Number(

        form.value.nota

      )


    };







    this.evaluationService

    .avaliar(request)

    .subscribe({




      next:avaliacao=>{


        this.avaliacoes.update(

          lista=>[

            ...lista,

            avaliacao

          ]

        );



        form.reset();



        this.savingId.set('');



      },





      error:e=>{


        this.erro.set(

          e.error?.mensagem ||

          'Erro ao guardar avaliação'

        );



        this.savingId.set('');



      }





    });



  }





}