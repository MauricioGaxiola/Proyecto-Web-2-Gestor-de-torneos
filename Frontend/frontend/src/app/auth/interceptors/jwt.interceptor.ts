// frontend/src/app/auth/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Este Interceptor añade el token JWT a todas las peticiones salientes
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authService = inject(AuthService);
  const token = authService.getToken(); // Obtenemos el token guardado

  // Si hay token, clonamos la petición y añadimos la cabecera de Autorización
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Si no hay token, simplemente dejamos pasar la petición
  return next(req);
};