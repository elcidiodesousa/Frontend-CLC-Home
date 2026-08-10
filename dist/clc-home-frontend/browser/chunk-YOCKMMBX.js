import{b as O,c as l,d as S,e as E,h as N,j as w,k as y,t as I,v as k}from"./chunk-2236FPKU.js";import{a as z}from"./chunk-PBKRYNST.js";import"./chunk-ECQOVOR7.js";import{a as v,d as P}from"./chunk-2F7XZDII.js";import"./chunk-KMTJ2OXE.js";import{g as _,k as M}from"./chunk-TSGC4A4A.js";import{Jb as t,Ka as p,Lb as b,Va as d,_a as u,db as x,ja as g,pb as f,qb as e,rb as n,sb as i,yb as C,zb as h}from"./chunk-ONRYM7GE.js";function F(o,r){if(o&1&&(e(0,"p"),t(1),n()),o&2){let D=h();p(),b(`
`,D.error(),`
`)}}var J=(()=>{let r=class r{constructor(a,m,s){this.fb=a,this.auth=m,this.route=s,this.error=g(""),this.loading=g(!1),this.form=this.fb.nonNullable.group({nome:["",l.required],email:["",[l.required,l.email]],password:["",[l.required,l.minLength(6)]],telefone:[""],endereco:[""],provincia:[""]});let c=this.route.snapshot.queryParamMap.get("evento");c&&localStorage.setItem("clc_return_url",`/app/inscricoes?evento=${encodeURIComponent(c)}`)}submit(){this.form.invalid||(this.loading.set(!0),this.error.set(""),this.auth.register(this.form.getRawValue()).subscribe({next:()=>{this.loading.set(!1)},error:a=>{this.error.set(a.error?.mensagem||a.error?.message||"Falha no registo."),this.loading.set(!1)}}))}};r.\u0275fac=function(m){return new(m||r)(d(I),d(z),d(v))},r.\u0275cmp=u({type:r,selectors:[["ng-component"]],decls:38,vars:2,consts:[[1,"page"],[3,"ngSubmit","formGroup"],["routerLink","/"],["src","assets/clc-mark.svg"],[1,"grid"],["formControlName","nome"],["type","email","formControlName","email"],["formControlName","telefone"],["formControlName","provincia"],["formControlName","endereco"],["type","password","formControlName","password"],[4,"ngIf"],["routerLink","/entrar"]],template:function(m,s){m&1&&(e(0,"div",0)(1,"form",1),C("ngSubmit",function(){return s.submit()}),e(2,"a",2),i(3,"img",3),e(4,"b"),t(5,"CLC"),n(),t(6,` HOME
`),n(),e(7,"span"),t(8,"Criar conta"),n(),e(9,"h1"),t(10,`
Fa\xE7a parte do CLC Home
`),n(),e(11,"div",4)(12,"label"),t(13,`
Nome
`),i(14,"input",5),n(),e(15,"label"),t(16,`
Email
`),i(17,"input",6),n()(),e(18,"div",4)(19,"label"),t(20,`
Telefone
`),i(21,"input",7),n(),e(22,"label"),t(23,`
Prov\xEDncia
`),i(24,"input",8),n()(),e(25,"label"),t(26,`
Endere\xE7o
`),i(27,"input",9),n(),e(28,"label"),t(29,`
Senha
`),i(30,"input",10),n(),x(31,F,2,1,"p",11),e(32,"button"),t(33,`
Criar conta
`),n(),e(34,"small"),t(35,`
J\xE1 tem conta? `),e(36,"a",12),t(37,`
Entrar
`),n()()()()),m&2&&(p(),f("formGroup",s.form),p(30),f("ngIf",s.error()))},dependencies:[M,_,k,N,O,S,E,w,y,P],styles:[".page[_ngcontent-%COMP%]{min-height:100vh;display:grid;place-items:center;padding:35px;background:radial-gradient(circle at 10% 10%,rgba(98,87,232,.337254902),transparent 35%),linear-gradient(145deg,#0f132b,#1b2142)}form[_ngcontent-%COMP%]{width:min(100%,680px);background:#fff;padding:34px;border-radius:20px;display:grid;gap:15px;box-shadow:0 30px 90px #080a1766}form[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{display:flex;align-items:center;gap:7px;text-decoration:none;color:#f0a50e;font-size:1rem}form[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:38px}form[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]   b[_ngcontent-%COMP%]{color:#171e35}span[_ngcontent-%COMP%]{color:#6257e8;text-transform:uppercase;letter-spacing:.14em;font-size:.62rem;font-weight:900;margin-top:6px}h1[_ngcontent-%COMP%]{color:#171e35;margin:-4px 0 5px;font-size:1.8rem}.grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:14px}label[_ngcontent-%COMP%]{display:grid;gap:7px;font-size:.72rem;font-weight:800;color:#363d52}input[_ngcontent-%COMP%]{height:47px;border:1px solid #e0e3ec;border-radius:10px;padding:0 12px;font-size:.78rem}button[_ngcontent-%COMP%]{height:48px;border:0;border-radius:10px;background:linear-gradient(95deg,#6257e8,#5145cf);color:#fff;font-size:.76rem;font-weight:800;cursor:pointer;box-shadow:0 10px 25px #5145cf30}button[_ngcontent-%COMP%]:hover{transform:translateY(-1px)}p[_ngcontent-%COMP%]{background:#fff1f1;color:#b4323c;padding:10px 12px;border-radius:9px;font-size:.72rem}small[_ngcontent-%COMP%]{text-align:center;color:#868da0;font-size:.7rem}small[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:#5145cf;font-weight:800;text-decoration:none}@media(max-width:650px){.page[_ngcontent-%COMP%]{padding:18px}.grid[_ngcontent-%COMP%]{grid-template-columns:1fr}form[_ngcontent-%COMP%]{padding:25px 20px}}"]});let o=r;return o})();export{J as RegisterComponent};
