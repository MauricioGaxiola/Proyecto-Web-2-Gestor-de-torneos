// frontend/src/app/components/partidos/pages/listado/listado.component.ts
    
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { PartidosService, Partido } from '../../services/partidos.service';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss']
})
export class ListadoComponent implements OnInit {

  private partidosService = inject(PartidosService);
  public router = inject(Router); // Público para usar en el HTML
  
  public partidos$!: Observable<Partido[]>;
  public error: string | null = null;

  ngOnInit(): void {
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.partidos$ = this.partidosService.getPartidos().pipe(
      catchError(err => {
        // Importante: El listado se conecta con el endpoint del backend.
        // Si hay error 404, es probable que la ruta del backend esté pendiente.
        this.error = err.error?.error || 'Error al cargar los partidos. Verifica el Backend.';
        console.error('Error de carga:', err);
        return of([]); 
      })
    );
  }
  
  // Función que convierte la fecha y hora para mostrarla mejor
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Redirigir a la ruta de creación (a futuro)
  crearPartido() {
    this.router.navigate(['/partidos/crear']);
  }
}