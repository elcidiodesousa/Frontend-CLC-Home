import {inject} from '@angular/core';
import {ActivatedRouteSnapshot,CanActivateFn,Router} from '@angular/router';
import {AuthService,UserRole} from './auth.service';
export const roleGuard:CanActivateFn=(route:ActivatedRouteSnapshot)=>{const auth=inject(AuthService);const router=inject(Router);const allowed=(route.data['roles']??[]) as UserRole[];const current=auth.user()?.role;return current&&allowed.includes(current)?true:router.createUrlTree(['/app/sem-permissao']);};
