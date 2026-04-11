import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const loginGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  const section = authService.current;
  const now: number = Date.now();

  if(section.access_token){
    
    if(section.expires_token > now){
      return router.createUrlTree(['']);
    }

    if(section.expires_refresh_token > now){
      authService.refreshSection().subscribe();
      return router.createUrlTree(['']);
    }
  }

  return true;
};
