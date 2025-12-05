// frontend/src/app/components/dashboard/pages/inicio/inicio.component.ts

import { Component, OnInit, inject } from '@angular/core'; // <-- AGREGAR OnInit e inject
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
// Importamos módulos de RxJS para manejar múltiples llamadas y errores
import { Observable, forkJoin, map, catchError, of } from 'rxjs'; 

// Importar los servicios necesarios (Asegúrate que estas rutas sean correctas)
import { EquiposService } from '../../../equipos/services/equipos.service'; 
import { PartidosService } from '../../../partidos/services/partidos.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  // Asegúrate de que RouterModule esté aquí para que [routerLink] funcione en el HTML
  imports: [CommonModule, RouterModule], 
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit { // <-- IMPLEMENTAR OnInit
  
  // Inyección de servicios (Método 'inject' para standalone components)
  private equiposService = inject(EquiposService);
  private partidosService = inject(PartidosService);
  
  // Variables de control y datos
  public resumen$!: Observable<any>; // Observable para cargar los datos de resumen
  public idTorneoActivo: number = 1; // ID del torneo activo, por ahora lo fijamos a 1
  public error: string | null = null;
  
  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    // forkJoin combina Observables para cargar múltiples datos al mismo tiempo
    this.resumen$ = forkJoin({
      // 1. Total de Equipos: Obtenemos todos los equipos y contamos la longitud
      totalEquipos: this.equiposService.getEquipos(this.idTorneoActivo).pipe(
        map(equipos => equipos.length),
        catchError(() => of('N/A')) // Si falla, muestra N/A
      ),
      
      // 2. Total de Partidos: Obtenemos todos los partidos y contamos
      totalPartidos: this.partidosService.getPartidos().pipe(
        map(partidos => partidos.length),
        catchError(() => of('N/A'))
      ),

      // 3. Próximos Partidos (los 3 siguientes sin resultado)
      proximosPartidos: this.partidosService.getPartidos().pipe(
        map(partidos => partidos
          .filter(p => p.resultado_local === null) // Filtra solo los no jugados
          .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()) // Ordena por fecha
          .slice(0, 3) // Toma los primeros 3
        ),
        catchError(() => of([])) // Si falla, devuelve un array vacío
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