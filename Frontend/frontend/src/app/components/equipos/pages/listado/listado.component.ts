// frontend/src/app/components/equipos/pages/listado/listado.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
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
  private torneosService = inject(TorneosService); 
  
  public router = inject(Router); 
  private activatedRoute = inject(ActivatedRoute); 
  
  public equipos: any[] = [];
  //  ESTA VARIABLE ELIMINA EL ERROR DE LA TERMINAL
  // La usamos como alias para que el HTML Pro no falle
  public get torneos() { return this.equipos; }

  public errorMessage: string = '';
  public idTorneoActivo: number = 0; 
  public nombreTorneoActivo: string = 'Cargando Torneo...'; 

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
        const idTorneo = +params['idTorneo']; 
        
        if (idTorneo) {
            this.idTorneoActivo = idTorneo;
            this.cargarNombreTorneo(idTorneo);
            this.cargarEquipos(idTorneo);
        } else {
            this.errorMessage = 'Error: Selecciona un torneo para ver sus equipos.';
        }
    });
  }

  cargarNombreTorneo(idTorneo: number): void {
    this.torneosService.getTorneoById(idTorneo).subscribe({
        next: (torneo: any) => {
            this.nombreTorneoActivo = torneo.nombre;
        },
        error: (err) => {
            this.nombreTorneoActivo = 'Error al obtener nombre.'; 
            console.error('No se pudo obtener el nombre del torneo:', err);
        }
    });
  }

  cargarEquipos(idTorneo: number): void {
    this.equiposService.getEquipos(idTorneo).subscribe({
        next: (resp) => {
            this.equipos = resp; 
            this.errorMessage = '';
        },
        error: (err) => {
            this.errorMessage = 'Error al cargar los equipos. Asegúrate de que el Backend esté corriendo.';
            console.error('Error de carga de equipos:', err);
        }
    });
  }
  
  editarEquipo(idEquipo: number) {
    this.router.navigate(['/equipos/editar', idEquipo]);
  }

  eliminarEquipo(idEquipo: number, nombre: string) {
    if (confirm(`¿Estás seguro de eliminar el equipo "${nombre}"?`)) {
      this.equiposService.deleteEquipo(idEquipo).subscribe({
        next: () => {
          this.cargarEquipos(this.idTorneoActivo);
        },
        error: (err) => {
          alert(err.error?.error || 'Error al eliminar.');
        }
      });
    }
  }
}