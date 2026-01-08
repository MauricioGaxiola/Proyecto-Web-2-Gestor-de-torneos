// frontend/src/app/components/jugadores/pages/crear-jugador/crear-jugador.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JugadoresService } from '../../services/jugadores.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  public idJugador: number | null = null;
  public esEdicion: boolean = false;
  public errorMessage: string = '';
  
  public jugadorForm: FormGroup = this.fb.group({
    id_equipo: [0, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    posicion: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
  });

  ngOnInit(): void {
    // 1. Capturamos el ID del equipo
    const idEq = this.activatedRoute.snapshot.paramMap.get('idEquipo');
    this.idEquipo = idEq ? +idEq : null;
    this.jugadorForm.get('id_equipo')?.setValue(this.idEquipo);

    // 2. Capturamos el ID del jugador (si existe es EDICIÓN)
    const idJug = this.activatedRoute.snapshot.paramMap.get('id');
    if (idJug) {
      this.idJugador = +idJug;
      this.esEdicion = true;
      this.cargarDatosJugador(this.idJugador);
    }
  }

  cargarDatosJugador(id: number) {
    this.jugadoresService.getJugadorById(id).subscribe({
      next: (jugador) => {
        // Formatear fecha para el input date (YYYY-MM-DD)
        if (jugador.fecha_nacimiento) {
          jugador.fecha_nacimiento = jugador.fecha_nacimiento.split('T')[0];
        }
        this.jugadorForm.patchValue(jugador);
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el jugador.';
      }
    });
  }

  guardarJugador() {
    if (this.jugadorForm.invalid) {
      this.jugadorForm.markAllAsTouched();
      return;
    }

    const datosJugador = this.jugadorForm.value;

    if (this.esEdicion && this.idJugador) {
      // ACTUALIZAR
      this.jugadoresService.updateJugador(this.idJugador, datosJugador).subscribe({
        next: () => {
          this.router.navigate(['/equipos', this.idEquipo, 'jugadores']); 
        },
        error: (err) => this.errorMessage = 'Error al actualizar.'
      });
    } else {
      // CREAR
      this.jugadoresService.createJugador(datosJugador).subscribe({
        next: () => {
          this.router.navigate(['/equipos', this.idEquipo, 'jugadores']); 
        },
        error: (err) => this.errorMessage = 'Error al crear.'
      });
    }
  }

  cancelar() {
    this.router.navigate(['/equipos', this.idEquipo, 'jugadores']);
  }
}