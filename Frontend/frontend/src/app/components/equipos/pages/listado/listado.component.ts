// frontend/src/app/components/equipos/pages/listado/listado.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
// Importamos ActivatedRoute para leer el ID de la URL
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
import { Observable, catchError, of } from 'rxjs';

// 🟢 IMPORTACIÓN CORREGIDA: Usamos el TorneosService para el nombre
import { TorneosService } from '../../../torneos/services/torneos.service'; 
import { EquiposService, Equipo } from '../../services/equipos.service'; 

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss']
})
export class ListadoComponent implements OnInit {

  private equiposService = inject(EquiposService);
  // 🟢 INYECCIÓN CORREGIDA
  private torneosService = inject(TorneosService); // Usamos el servicio de Torneos
  
  public router = inject(Router); 
  private activatedRoute = inject(ActivatedRoute); 
  
  public equipos: Equipo[] = [];
  public errorMessage: string = '';
  
  public idTorneoActivo: number = 0; 
  public nombreTorneoActivo: string = 'Cargando Torneo...'; 

  ngOnInit(): void {
    // 1. Leer el ID del Torneo de la URL
    this.activatedRoute.params.subscribe(params => {
        const idTorneo = +params['idTorneo']; 
        
        if (idTorneo) {
            this.idTorneoActivo = idTorneo;
            // 2. Cargar el nombre y la lista de equipos usando el ID
            this.cargarNombreTorneo(idTorneo);
            this.cargarEquipos(idTorneo);
        } else {
            this.errorMessage = 'Error: Selecciona un torneo para ver sus equipos.';
        }
    });
  }

  cargarNombreTorneo(idTorneo: number): void {
    // 🟢 LLAMADA CORREGIDA: Usamos torneosService en lugar de partidosService
    this.torneosService.getTorneoById(idTorneo).subscribe({
        next: (torneo: any) => {
            this.nombreTorneoActivo = torneo.nombre; // Lee el nombre real de la DB
        },
        error: (err) => {
            this.nombreTorneoActivo = 'Error al obtener nombre.'; 
            console.error('No se pudo obtener el nombre del torneo:', err);
        }
    });
  }

  cargarEquipos(idTorneo: number): void {
    // Carga los equipos que pertenecen al ID de torneo activo
    this.equiposService.getEquipos(idTorneo).subscribe({
        next: (resp) => {
            this.equipos = resp; 
            this.errorMessage = '';
        },
        error: (err) => {
            this.errorMessage = 'Error al cargar los equipos. Asegúrate de que el Backend esté corriendo y el Token sea válido.';
            console.error('Error de carga de equipos:', err);
        }
    });
  }
  
  // CRUD: Función para Edición
  editarEquipo(idEquipo: number) {
    this.router.navigate(['/equipos/editar', idEquipo]);
  }

  // CRUD: Función para Eliminación
  eliminarEquipo(idEquipo: number, nombre: string) {
    if (confirm(`¿Estás seguro de eliminar el equipo "${nombre}"? Se borrarán todos los jugadores asociados.`)) {
      this.equiposService.deleteEquipo(idEquipo).subscribe({
        next: () => {
          alert(`Equipo "${nombre}" eliminado con éxito.`);
          this.cargarEquipos(this.idTorneoActivo); // Recargar la lista
        },
        error: (err) => {
          const msg = err.error?.error || 'Error al eliminar. Verifique que no tenga jugadores asociados.';
          alert(msg);
          console.error('Error al eliminar:', err);
        }
      });
    }
  }
}