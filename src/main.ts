import {registerLocaleData} from '@angular/common';
import localePt from '@angular/common/locales/pt-PT';
import {LOCALE_ID} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';
import {authInterceptor} from './app/core/auth.interceptor';
import {apiErrorInterceptor} from './app/core/api-error.interceptor';

// Datas e números em português (ex.: "13 nov. 2026").
registerLocaleData(localePt, 'pt-PT');

bootstrapApplication(AppComponent, {
  providers: [
    {provide: LOCALE_ID, useValue: 'pt-PT'},
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
    provideAnimationsAsync()
  ]
}).catch(console.error);
