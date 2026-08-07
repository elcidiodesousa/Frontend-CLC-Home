import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  error = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefone: [''],
    endereco: [''],
    provincia: ['']
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute) {
    const evento = this.route.snapshot.queryParamMap.get('evento');
    if (evento) localStorage.setItem('clc_return_url', `/app/inscricoes?evento=${encodeURIComponent(evento)}`);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      // CORRIGIDO: não navegar aqui — auth.service já navega após save()
      next: () => { this.loading.set(false); },
      error: e => {
        this.error.set(e.error?.mensagem || e.error?.message || 'Falha no registo.');
        this.loading.set(false);
      }
    });
  }
}