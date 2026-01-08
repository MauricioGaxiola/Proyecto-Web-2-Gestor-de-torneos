// frontend/src/app/components/dashboard/pages/inicio/inicio.component.ts

import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, map, catchError, of } from 'rxjs'; 

// Importar los servicios
import { EquiposService } from '../../../equipos/services/equipos.service'; 
import { PartidosService } from '../../../partidos/services/partidos.service';
import { AuthService } from '../../../../auth/services/auth.service'; // <-- Importamos AuthService


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit { 
  
  // Inyección de servicios
  private equiposService = inject(EquiposService);
  private partidosService = inject(PartidosService);
  private authService = inject(AuthService); // <-- INYECCIÓN DE AUTHSERVICE
  
  // Variables de control y datos
  public resumen$!: Observable<any>; 
  public idTorneoActivo: number = 1; 
  public error: string | null = null;
  //  AÑADIDO: Variable para mostrar el rol del usuario
  public rolUsuario: string = 'Cargando...'; 
  
  ngOnInit(): void {
    this.cargarResumen();
    this.cargarRol(); // <--- Llamamos a la nueva función
  }

  cargarRol(): void {
      const userData = this.authService.getUserDataFromToken(); // Obtener datos del token
      this.rolUsuario = userData ? userData.rol.toUpperCase() : 'INVITADO';
  }

  cargarResumen(): void {
    // forkJoin combina Observables
    this.resumen$ = forkJoin({
      // 1. Total de Equipos
      totalEquipos: this.equiposService.getEquipos(this.idTorneoActivo).pipe(
        map(equipos => equipos.length),
        catchError(() => of('N/A')) 
      ),
      
      // 2. Total de Partidos
      totalPartidos: this.partidosService.getPartidos().pipe(
        map(partidos => partidos.length),
        catchError(() => of('N/A'))
      ),

      // 3. Próximos Partidos (los 3 siguientes sin resultado)
      proximosPartidos: this.partidosService.getPartidos().pipe(
        map(partidos => partidos
          .filter(p => p.resultado_local === null) 
          .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()) 
          .slice(0, 3) 
        ),
        catchError(() => of([]))
      )
      
    }).pipe(
      // Manejo de errores general
      catchError(err => {
        this.error = 'Error al cargar el resumen del Dashboard. Verifique su conexión al Backend.';
        console.error('Error cargando resumen:', err);
        return of(null);
      })
    );
  }
}