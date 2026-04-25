import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const section = authService.current;
  const router = inject(Router);

  if(section.userid === 'demo') return true;
  if(section.access_token) return true;

  return router.createUrlTree(['login']);
  
};
