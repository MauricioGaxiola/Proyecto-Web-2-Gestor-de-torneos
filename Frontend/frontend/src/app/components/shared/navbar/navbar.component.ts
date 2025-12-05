// frontend/src/app/components/shared/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router'; // <--- AÑADIDO: Para usar [routerLink]
import { AuthService } from '../../../auth/services/auth.service'; // <--- RUTA CORRECTA
@Component({
  selector: 'app-navbar',
  standalone: true,
  // CORRECCIÓN 1: Añadimos RouterModule
  imports: [RouterModule], 
  // CORRECCIÓN 2: Usamos el sufijo .component en el HTML/CSS
  templateUrl: './navbar.component.html', 
  styleUrls: ['./navbar.component.scss'], // Nota: styleUrl cambió a styleUrls
})
export class NavbarComponent { // <--- CORRECCIÓN 3: Clase renombrada a NavbarComponent

  private authService = inject(AuthService);
  // private router = inject(Router); // Lo puedes inyectar si lo necesitas

  // Función de prueba para cerrar sesión
  logout() {
    // 1. Eliminar el token del almacenamiento local
    localStorage.removeItem('token');
    // 2. Redirigir al Login
    // Usamos location.reload() para recargar la página, pero lo ideal es usar el Router
    // En este ejemplo simple, te redirigiremos al login:
    window.location.href = '/auth/login'; 
  }
}