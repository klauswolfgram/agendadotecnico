import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Section } from '../models/section';
import { environment } from '../environments/environment';
import { switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const section: Section = authService.current;

  //-- requisicao de geracao de token
  if(section?.access_token.length <= 0) return next(req);

  //-- requisicao com token valido
  if(section.expires_token > Date.now()) {
    const newReq = req.clone({setHeaders: {
      Authorization: `Bearer ${section.access_token}`,
      tenantId: environment.tenantId,
      username: `Integracao`
    }});

    return next(newReq);
  }

  //-- executa o refresh e segue com a requisicao
  return authService.refreshSection().pipe(switchMap(newSection => {
    const newReq = req.clone({setHeaders: {
      Authorization: `Bearer ${newSection.access_token}`,
      tenantId: environment.tenantId,
      username: `Integracao`
    }});
    return next(newReq);
  }))
  
  return next(req);
};
