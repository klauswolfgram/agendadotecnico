import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { PoHttpRequestModule } from '@po-ui/ng-components';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { StorageService } from './core/services/storage-service';
import { Section } from './core/models/section';
import { environment } from './core/environments/environment';
import { AuthService } from './core/services/auth-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => init()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom([PoHttpRequestModule]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([authInterceptor])), 
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ],
  
};

const init = async () => {

  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  
  const section: Section = await storageService.get(environment.STORAGE_KEY_SECTION) ?? new Section();

  authService.setSection(section);

}