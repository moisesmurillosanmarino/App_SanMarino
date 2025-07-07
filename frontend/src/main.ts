// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }      from './app/app.component';
import { appConfig }         from './app/app.config';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideHttpClient(),    // ← inyecta HttpClient en todo tu árbol
    ...(appConfig.providers || []),
  ]
})
  .catch(err => console.error(err));
