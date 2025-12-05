// frontend/src/app/auth/guards/auth.guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
    
    // Inyectamos el router
    const router = inject(Router);
    
    // 1. Verificar si existe el token en el almacenamiento local
    const token = localStorage.getItem('token'); 

    if (token) {
        // 2. Si hay token, permitimos el acceso a la ruta
        return true;
    } else {
        // 3. Si no hay token, redirigimos al login
        console.warn('Acceso denegado: Token no encontrado.');
        // Nos aseguramos de que el token sea eliminado (si fue inválido)
        localStorage.removeItem('token');
        router.navigateByUrl('/auth/login');
        return false;
    }
};