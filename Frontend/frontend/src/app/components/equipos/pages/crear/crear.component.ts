// frontend/src/app/components/equipos/pages/crear/crear.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EquiposService } from '../../../equipos/services/equipos.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.scss']
})
export class CrearComponent {

  private fb = inject(FormBuilder);
  private equiposService = inject(EquiposService);
  private router = inject(Router);
  
  public errorMessage: string = '';
  
  // Definición del formulario
  public equipoForm: FormGroup = this.fb.group({
    // Usamos el ID del torneo de prueba para la inserción
    id_torneo:          [1, Validators.required], 
    nombre:             ['', [Validators.required, Validators.minLength(3)]],
    contacto_capitan:   ['', Validators.required],
    telefono_capitan:   ['', Validators.required],
    pagado:             [false] // Campo por defecto: no pagado
  });

  // Función que se ejecuta al enviar el formulario (POST)
  guardarEquipo() {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      return;
    }

    const nuevoEquipo = this.equipoForm.value;

    this.equiposService.createEquipo(nuevoEquipo).subscribe({
      next: (resp) => {
        console.log('Equipo Creado:', resp);
        // Éxito: Navegar de vuelta al listado
        this.router.navigateByUrl('/equipos'); 
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al guardar el equipo. Revisa el Backend.';
        console.error('Error al crear equipo:', err);
      }
    });
  }

  // Navegar de vuelta al listado
  cancelar() {
    this.router.navigateByUrl('/equipos');
  }
}