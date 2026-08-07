import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Estes endpoints são públicos e não devem receber Authorization,
  // mesmo quando o navegador ainda guarda uma sessão anterior.
  const publicRequest =
    request.url.includes('/auth/login') ||
    request.url.includes('/auth/registar') ||
    request.url.includes('/eventos/publicados') ||
    request.url.includes('/votos/publico');

  const requestToSend = token && !publicRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest =
        request.url.includes('/auth/login') ||
        request.url.includes('/auth/registar');

      // Não termina a sessão por causa de uma falha de votação pública.
      if (error.status === 401 && !isAuthRequest && !publicRequest) {
        auth.logout();
      }

      return throwError(() => error);
    })
  );
};
