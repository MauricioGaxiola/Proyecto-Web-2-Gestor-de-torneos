// frontend/src/app/components/jugadores/pages/listado-jugadores/listado-jugadores.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JugadoresService, Jugador } from '../../services/jugadores.service';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-listado-jugadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-jugadores.component.html',
  styleUrls: ['./listado-jugadores.component.scss']
})
export class ListadoJugadoresComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private jugadoresService = inject(JugadoresService);
  public router = inject(Router);

  public idEquipo: number | null = null;
  public nombreEquipo: string = 'Cargando...'; // Necesitarás obtener esto del equipo padre
  public jugadores$: Observable<Jugador[]> | undefined;
  public error: string | null = null;

  ngOnInit(): void {
    // Capturamos el ID del equipo de la URL (ruta anidada)
    this.jugadores$ = this.activatedRoute.paramMap.pipe(
      // 1. Extraer el id del equipo de los parámetros de la ruta
      switchMap(params => {
        const id = params.get('idEquipo');
        if (id) {
          this.idEquipo = +id; // Convertir a número
          // (FALTA obtener el nombre del equipo aquí, lo haremos luego)
          return this.jugadoresService.getJugadoresPorEquipo(this.idEquipo);
        }
        this.error = 'ID de equipo no especificado.';
        return of([]);
      }),
      // 2. Manejar cualquier error de la petición GET
      catchError(err => {
        this.error = err.error?.error || 'Error al cargar los jugadores.';
        console.error('Error de carga:', err);
        return of([]);
      })
    );
  }

  // Navegar de vuelta al listado principal de equipos
  volverAEquipos() {
    this.router.navigateByUrl('/equipos');
  }

  // Evento simulado para agregar un nuevo jugador (a implementar)
  agregarJugador() {
    // Por ahora, solo navegamos a la ruta de creación (a definir en app.routes.ts)
    this.router.navigate(['/equipos', this.idEquipo, 'crear-jugador']); 
  }
}