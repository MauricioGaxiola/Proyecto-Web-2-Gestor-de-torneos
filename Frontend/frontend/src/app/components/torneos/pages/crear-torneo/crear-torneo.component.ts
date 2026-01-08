// frontend/src/app/components/torneos/pages/crear-torneo/crear-torneo.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms'; // Añadir AbstractControl y ValidatorFn
import { TorneosService } from '../../services/torneos.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

//  FUNCIÓN DE VALIDACIÓN: La fecha no puede ser en el pasado
export function futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para solo comparar la fecha
        const dateValue = new Date(control.value);

        if (dateValue.getTime() < today.getTime()) {
            // Si la fecha seleccionada es anterior a hoy
            return { 'pastDate': { value: control.value } };
        }
        return null;
    };
}

//  FUNCIÓN DE VALIDACIÓN: La fecha de fin debe ser posterior a la de inicio
export function dateRangeValidator(dateInicioControlName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        // Obtenemos el formulario completo para comparar los dos campos
        const formGroup = control.parent as FormGroup; 
        if (!formGroup) return null;

        const dateInicioControl = formGroup.get(dateInicioControlName);
        const dateFinValue = new Date(control.value);
        const dateInicioValue = new Date(dateInicioControl?.value);

        // Solo validamos si ambas fechas tienen valor
        if (dateInicioControl && dateInicioControl.value && control.value) {
            if (dateFinValue.getTime() < dateInicioValue.getTime()) {
                // Si la fecha de fin es anterior a la fecha de inicio
                return { 'dateMismatch': { value: control.value } };
            }
        }
        return null;
    };
}


@Component({
  selector: 'app-crear-torneo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear-torneo.component.html',
  styleUrls: ['./crear-torneo.component.scss']
})
export class CrearTorneoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private torneosService = inject(TorneosService);
  private router = inject(Router);
  
  public errorMessage: string = '';
  
  public torneoForm: FormGroup = this.fb.group({
    nombre:           ['', [Validators.required, Validators.minLength(4)]],
    categoria:        ['', Validators.required],
    //  APLICACIÓN DE VALIDACIÓN: futureDateValidator
    fecha_inicio:     ['', [Validators.required, futureDateValidator()]], 
    //  APLICACIÓN DE VALIDACIÓN: dateRangeValidator
    fecha_fin:        ['', [Validators.required, dateRangeValidator('fecha_inicio')]], 
    costo_inscripcion: [0, [Validators.min(0)]],
    estado:           ['activo', Validators.required],
  });
    
    ngOnInit(): void {
        // Aquí puedes forzar la validación cruzada cuando la fecha de inicio cambia
        this.torneoForm.get('fecha_inicio')?.valueChanges.subscribe(() => {
            this.torneoForm.get('fecha_fin')?.updateValueAndValidity();
        });
    }

  guardarTorneo() {
    if (this.torneoForm.invalid) {
      this.torneoForm.markAllAsTouched();
      return;
    }

    // ... (Lógica de guardado existente)
    const nuevoTorneo = this.torneoForm.value;

    this.torneosService.createTorneo(nuevoTorneo).subscribe({
        next: (resp) => {
            alert('Torneo creado con éxito.');
            this.router.navigate(['/torneos']);
        },
        error: (err) => {
            this.errorMessage = err.error?.error || 'Error al guardar el torneo. Revisa el Backend.';
            console.error('Error al crear torneo:', err);
        }
    });
  }
  
  //  FUNCIÓN AÑADIDA: Resuelve el error de compilación y navega de vuelta
  cancelar() {
    this.router.navigateByUrl('/torneos');
  }
}