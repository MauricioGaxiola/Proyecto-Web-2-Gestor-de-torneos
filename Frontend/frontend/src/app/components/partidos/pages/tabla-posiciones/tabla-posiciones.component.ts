// frontend/src/app/components/partidos/pages/tabla-posiciones/tabla-posiciones.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidosService } from '../../services/partidos.service'; 
import { Observable, catchError, map, of } from 'rxjs';

// Definición de la estructura de la tabla (Basada en tu JSON de Postman)
interface Posicion {
  id_equipo: number;
  equipo_nombre: string;
  PJ_Local: string;
  PJ_Visitante: string;
  Pts: string; // Puntos
  GF: string; // Goles a Favor
  GA: string; // Goles en Contra
  DG: number; // Diferencia de Goles (Calculada en Frontend)
  PJ: number; // Partidos Jugados (Calculada en Frontend)
}

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-posiciones.component.html',
  styleUrls: ['./tabla-posiciones.component.scss']
})
export class TablaPosicionesComponent implements OnInit {

  private partidosService = inject(PartidosService);
  // Asumimos Torneo ID 1 para la prueba
  public idTorneo: number = 1; 
  
  public tablaPosiciones$!: Observable<Posicion[]>;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    this.cargarTabla();
  }

  cargarTabla(): void {
    this.tablaPosiciones$ = this.partidosService.getTablaPosiciones(this.idTorneo).pipe(
      // Mapeamos los datos para calcular PJ y DG en el frontend
      map(data => {
        return data.map(item => ({
          ...item,
          // Convertimos strings a números para el cálculo
          PJ: parseInt(item.PJ_Local) + parseInt(item.PJ_Visitante),
          DG: parseInt(item.GF) - parseInt(item.GA)
        }));
      }),
      catchError(err => {
        this.errorMessage = 'Error al cargar la tabla. Asegúrate de tener partidos con resultados.';
        console.error('Error de carga de tabla:', err);
        return of([]);
      })
    );
  }
}