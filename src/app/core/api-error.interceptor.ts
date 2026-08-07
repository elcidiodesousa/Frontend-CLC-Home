import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

function mensagemApi(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Não foi possível comunicar com o servidor. Confirme se a API está em execução.';
  const body = error.error;
  if (typeof body === 'string' && body.trim()) return body;
  if (body && typeof body === 'object') {
    const value = body.mensagem ?? body.message ?? body.erro ?? body.error;
    if (typeof value === 'string' && value.trim()) return value;
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors).find(v => typeof v === 'string');
      if (typeof first === 'string') return first;
    }
  }
  if (error.status === 403) return 'Não possui permissão para realizar esta operação.';
  if (error.status === 404) return 'A informação solicitada não foi encontrada.';
  if (error.status >= 500) return 'O servidor não conseguiu concluir a operação. Tente novamente.';
  return 'Não foi possível concluir a operação.';
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const normalized = new Error(mensagemApi(error));
      Object.assign(normalized, { status: error.status, original: error });
      return throwError(() => normalized);
    })
  );
