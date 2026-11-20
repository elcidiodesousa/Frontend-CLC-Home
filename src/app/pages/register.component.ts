import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../core/auth.service';
import {AuthVisualComponent} from '../shared/auth-visual.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, AuthVisualComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./auth.shared.scss', './register.component.scss']
})
export class RegisterComponent {
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  readonly provincias = ['Maputo Cidade', 'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'];

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

  invalid(name: 'nome' | 'email' | 'password') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  /** Indicador visual simples: comprimento + variedade de caracteres. */
  strength() {
    const v = this.form.controls.password.value;
    let score = 0;
    if (v.length >= 6) score++;
    if (v.length >= 10) score++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    const level = Math.max(1, score);
    return {level, label: ['', 'fraca', 'razoável', 'boa', 'forte'][level]};
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      // auth.service já navega após guardar a sessão
      next: () => this.loading.set(false),
      error: e => {
        this.error.set(e.error?.mensagem || e.error?.message || 'Falha no registo.');
        this.loading.set(false);
      }
    });
  }
}
