// frontend/src/app/components/torneos/pages/listado/listado.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { TorneosService, Torneo } from '../../services/torneos.service'; // <-- NUEVO SERVICIO
// Importamos EquiposService (aunque se llama desde un path extraño, lo mantenemos)
import { EquiposService } from '../../../../components/equipos/services/equipos.service'; 

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss']
})
export class ListadoComponent implements OnInit {

  private torneosService = inject(TorneosService); // <-- USAMOS EL SERVICIO DEDICADO
  private equiposService = inject(EquiposService);
  public router = inject(Router);
  
  public torneos$!: Observable<Torneo[]>; // Observable para los torneos
  public error: string | null = null;

  ngOnInit(): void {
    this.cargarTorneos();
  }

  cargarTorneos(): void {
    //  LÓGICA CORREGIDA: Llama al servicio que pide la lista de Torneos del Backend
    this.torneos$ = this.torneosService.getTorneos().pipe(
      catchError(err => {
        this.error = 'Error al cargar el listado de torneos.';
        console.error('Error de carga de torneos:', err);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }
  
  // Función de navegación para el botón "+ Crear Nuevo Torneo"
  crearTorneo() {
    this.router.navigate(['/torneos/crear']);
  }
  
  //  NUEVA FUNCIÓN: Navegar a Edición (PUT)
  editarTorneo(idTorneo: number) {
    alert(`Funcionalidad de Edición para Torneo ID ${idTorneo} en desarrollo.`);
    // this.router.navigate(['/torneos/editar', idTorneo]);
  }
  
  //  NUEVA FUNCIÓN: Eliminar Torneo (DELETE)
  eliminarTorneo(idTorneo: number, nombre: string) {
    if (confirm(`¿Estás seguro de eliminar el torneo "${nombre}"? Se borrarán todos los equipos, jugadores y partidos asociados.`)) {
      
      // NOTA: EL ENDPOINT DE ELIMINACIÓN DE TORNEOS AÚN NO EXISTE EN EL BACKEND
      alert(`Lógica de eliminación de Torneo ID ${idTorneo} en desarrollo.`);
      
      // 1. LLAMADA REAL DEL SERVICIO (DELETE)
      // this.torneosService.deleteTorneo(idTorneo).subscribe({
      //    next: () => { this.cargarTorneos(); },
      //    error: (err) => { alert('No se pudo eliminar: ' + err.error?.error); }
      // });
      
      this.cargarTorneos(); // Recargar la lista después de la acción (simulación)
    }
  }
}