import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/start/app';
import { appConfig } from './app/start/app.config';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
