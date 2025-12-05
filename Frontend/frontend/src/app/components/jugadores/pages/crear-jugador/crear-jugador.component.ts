// frontend/src/app/components/jugadores/pages/crear-jugador/crear-jugador.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JugadoresService } from '../../services/jugadores.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs'; // Necesario para obtener el ID de la ruta

@Component({
  selector: 'app-crear-jugador',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear-jugador.component.html',
  styleUrls: ['./crear-jugador.component.scss']
})
export class CrearJugadorComponent implements OnInit {

  private fb = inject(FormBuilder);
  private jugadoresService = inject(JugadoresService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  public idEquipo: number | null = null;
  public errorMessage: string = '';
  
  // Definición del formulario
  public jugadorForm: FormGroup = this.fb.group({
    id_equipo:          [0, Validators.required], // Se llenará con el valor de la URL
    nombre:             ['', [Validators.required, Validators.minLength(3)]],
    posicion:           ['', Validators.required],
    fecha_nacimiento:   ['', Validators.required], // Formato YYYY-MM-DD
  });

  ngOnInit(): void {
    // Capturamos el ID del equipo de la URL
    this.activatedRoute.paramMap.pipe(
      tap(params => {
        const id = params.get('idEquipo');
        this.idEquipo = id ? +id : null; 
        // Asignamos el ID del equipo al formulario
        this.jugadorForm.get('id_equipo')?.setValue(this.idEquipo);
      })
    ).subscribe();
  }

  // Función que se ejecuta al enviar el formulario (POST)
  guardarJugador() {
    if (this.jugadorForm.invalid) {
      this.jugadorForm.markAllAsTouched();
      return;
    }

    const nuevoJugador = this.jugadorForm.value;

    this.jugadoresService.createJugador(nuevoJugador).subscribe({
      next: (resp) => {
        console.log('Jugador Creado:', resp);
        // Éxito: Navegar de vuelta al listado de jugadores de ese equipo
        this.router.navigate(['/equipos', this.idEquipo, 'jugadores']); 
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al guardar el jugador. Revisa el Backend.';
        console.error('Error al crear jugador:', err);
      }
    });
  }

  // Navegar de vuelta al listado
  cancelar() {
    this.router.navigate(['/equipos', this.idEquipo, 'jugadores']);
  }
}