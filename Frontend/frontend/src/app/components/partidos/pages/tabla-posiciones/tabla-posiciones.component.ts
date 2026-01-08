import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importante para navegación
import { PartidosService } from '../../services/partidos.service'; 
import { Observable, catchError, map, of } from 'rxjs';

interface Posicion {
  id_equipo: number;
  equipo_nombre: string;
  PJ_Local: string;
  PJ_Visitante: string;
  Pts: string; // Viene como string del backend
  GF: string;
  GA: string;
  DG: number; // Calculado
  PJ: number; // Calculado
}

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tabla-posiciones.component.html',
  styleUrls: ['./tabla-posiciones.component.scss']
})
export class TablaPosicionesComponent implements OnInit {

  private partidosService = inject(PartidosService);
  
  // ID del torneo (puedes hacerlo dinámico con ActivatedRoute más adelante)
  public idTorneo: number = 1; 
  
  public tablaPosiciones$!: Observable<Posicion[]>;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    this.cargarTabla();
  }

  cargarTabla(): void {
    this.tablaPosiciones$ = this.partidosService.getTablaPosiciones(this.idTorneo).pipe(
      map(data => {
        return data.map(item => ({
          ...item,
          // 1. Cálculos de UI
          PJ: parseInt(item.PJ_Local) + parseInt(item.PJ_Visitante),
          DG: parseInt(item.GF) - parseInt(item.GA)
        }))
        // 2. ORDENAMIENTO (Crucial para una tabla de posiciones)
        .sort((a, b) => {
          const ptsA = parseInt(a.Pts);
          const ptsB = parseInt(b.Pts);
          
          // Primero ordena por Puntos (Mayor a menor)
          if (ptsA !== ptsB) return ptsB - ptsA;
          
          // Si empatan en puntos, ordena por Diferencia de Goles
          return b.DG - a.DG;
        });
      }),
      catchError(err => {
        this.errorMessage = 'No se pudieron cargar los datos. Intenta más tarde.';
        console.error('Error:', err);
        return of([]);
      })
    );
  }
}