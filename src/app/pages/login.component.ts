import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    LogoComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loading = signal(false);

  error = signal('');

  form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      Validators.required
    ]
  });


  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ){}


  submit(){

    if(this.form.invalid)
      return;


    this.loading.set(true);
    this.error.set('');


    this.auth.login(
      this.form.getRawValue()
    )
    .subscribe({

      next:()=>{
        this.loading.set(false);
      },


      error:e=>{

        this.error.set(
          e.error?.mensagem ||
          e.error?.message ||
          'Email ou password incorrectos.'
        );

        this.loading.set(false);

      }

    });

  }

}