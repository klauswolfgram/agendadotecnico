import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './app/core/environments/environment';
import { hideAppSplash, setAppSplashVersion } from './app/core/utils/app-splash';

setAppSplashVersion(environment.versao);
bootstrapApplication(App, appConfig)
  .then(() => hideAppSplash())
  .catch((err) => console.error(err));
