// frontend/src/app/app.ts

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Importamos los módulos necesarios para el layout
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { RouterModule } from '@angular/router'; // Necesario para [routerLink] en el Navbar

@Component({
  selector: 'app-root',
  // CORRECCIÓN: Añadimos NavbarComponent y RouterModule a las importaciones
  imports: [RouterOutlet, NavbarComponent, RouterModule], 
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent { // Renombrado a AppComponent para seguir la convención
  protected readonly title = signal('Gestor de Torneos');
}