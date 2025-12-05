// frontend/src/app/app.config.ts

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// 1. IMPORTACIÓN CLAVE: Añadir withInterceptors
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
// 2. IMPORTAR el interceptor
import { jwtInterceptor } from './auth/interceptors/jwt.interceptor'; 

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // 3. APLICAR EL INTERCEPTOR A LAS PETICIONES HTTP
    provideHttpClient(
      withInterceptors([jwtInterceptor]) // <-- ¡LÍNEA CLAVE!
    )
  ]
};