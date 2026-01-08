// frontend/src/app/components/jugadores/pages/listado-jugadores/listado-jugadores.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JugadoresService, Jugador } from '../../services/jugadores.service';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, catchError, of, tap, BehaviorSubject } from 'rxjs'; 
import { EquiposService } from '../../../equipos/services/equipos.service'; 

@Component({
  selector: 'app-listado-jugadores',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './listado-jugadores.component.html',
  styleUrls: ['./listado-jugadores.component.scss']
})
export class ListadoJugadoresComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private jugadoresService = inject(JugadoresService);
  private equiposService = inject(EquiposService); 
  public router = inject(Router); 
  
  private refreshSubject = new BehaviorSubject<number | null>(null); 
  
  public idEquipo: number | null = null;
  public nombreEquipo: string = 'Cargando...'; 
  public jugadores$!: Observable<Jugador[]>;
  public error: string | null = null;

  ngOnInit(): void {
    // 1. Suscribirse al Subject de recarga y definir el observable principal
    this.jugadores$ = this.refreshSubject.pipe(
      switchMap(idEquipo => {
        if (!idEquipo) {
            return of([]); 
        }
        
        this.loadEquipoDetails(idEquipo); 
        
        return this.jugadoresService.getJugadoresPorEquipo(idEquipo).pipe(
          tap(() => console.log('Recargando lista de jugadores')), 
          catchError(err => {
            this.error = err.error?.error || 'Error al cargar los jugadores.';
            console.error('Error de carga:', err);
            return of([]);
          })
        );
      }),
    );

    // 2. Obtener el ID de la URL y disparar la carga
    this.activatedRoute.paramMap.subscribe(params => {
        const id = params.get('idEquipo');
        if (id) {
            this.idEquipo = +id;
            this.refreshSubject.next(this.idEquipo); 
        }
    });
  }

  loadEquipoDetails(id: number): void {
      setTimeout(() => {
          this.nombreEquipo = `Equipo #${id}`;
      }, 0);
  }

  //  FUNCIÓN DE EDICIÓN AÑADIDA
  editarJugador(idJugador: number) {
    // Navegamos a la ruta: /equipos/:idEquipo/jugadores/editar/:id
    if (this.idEquipo) {
      this.router.navigate(['/equipos', this.idEquipo, 'jugadores', 'editar', idJugador]);
    }
  }

  // FUNCIÓN DE ELIMINACIÓN
  eliminarJugador(idJugador: number, nombreJugador: string) {
    if (!confirm(`¿Estás seguro de eliminar al jugador "${nombreJugador}"?`)) {
        return;
    }

    this.jugadoresService.deleteJugador(idJugador).subscribe({
        next: () => {
            alert(`Jugador ${nombreJugador} eliminado con éxito.`);
            if (this.idEquipo) {
                this.refreshSubject.next(this.idEquipo); 
            }
        },
        error: (err) => {
            console.error('Error al eliminar jugador:', err);
            alert(err.error?.error || 'No se pudo eliminar el jugador.');
        }
    });
  }

  volverAEquipos() {
    this.router.navigateByUrl('/equipos'); 
  }

  agregarJugador() {
    if (this.idEquipo) {
      this.router.navigate(['/equipos', this.idEquipo, 'jugadores', 'crear']); 
    }
  }
}