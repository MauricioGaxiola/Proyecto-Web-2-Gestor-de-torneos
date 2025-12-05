// frontend/src/app/components/partidos/pages/crear-partido/crear-partido.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EquiposService, Equipo } from '../../../equipos/services/equipos.service'; 
import { PartidosService, Partido } from '../../services/partidos.service'; // Importamos la interfaz Partido
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-crear-partido',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear-partido.component.html',
  styleUrls: ['./crear-partido.component.scss']
})
export class CrearPartidoComponent implements OnInit {

  private fb = inject(FormBuilder);
  // CORRECCIÓN 1: Hacemos las inyecciones de navegación públicas
  public router = inject(Router); 
  public route = inject(ActivatedRoute); 
  
  private equiposService = inject(EquiposService);
  private partidosService = inject(PartidosService);
  
  public equipos$!: Observable<Equipo[]>;
  public errorMessage: string = '';
  public idTorneoPrueba: number = 1; 
  
  public isUpdateMode: boolean = false;
  public partidoId!: number;
  
  // AÑADIDO: Variable para guardar los detalles del partido (incluye nombres de equipos)
  public partidoActual: Partido | null = null; 
  
  // 1. Formulario para CREAR/PROGRAMAR un Partido
  public partidoForm: FormGroup = this.fb.group({
    id_equipo_local:      ['', Validators.required], 
    id_equipo_visitante:  ['', Validators.required],
    fecha_partido:        ['', Validators.required], 
    hora_partido:         ['', Validators.required]
  }, {
    validators: this.equiposDiferentes('id_equipo_local', 'id_equipo_visitante')
  });

  // 2. Formulario para ACTUALIZAR RESULTADOS (usado en modo Update)
  public resultadoForm: FormGroup = this.fb.group({
    resultado_local:    [0, [Validators.required, Validators.min(0)]],
    resultado_visitante: [0, [Validators.required, Validators.min(0)]],
  });


  ngOnInit(): void {
    // Suscribir a los parámetros de la ruta
    this.route.params.subscribe(params => {
        const id = +params['id'];
        
        if (id) {
            // Modo Actualizar Resultado
            this.isUpdateMode = true;
            this.partidoId = id;
            this.loadPartidoDetalles(id); // <--- CARGA LOS DETALLES DEL PARTIDO
        } else {
            // Modo Creación
            this.loadEquipos();
        }
    });
  }

  loadEquipos(): void {
     this.equipos$ = this.equiposService.getEquipos(this.idTorneoPrueba).pipe(
      catchError(err => {
        this.errorMessage = 'Error al cargar equipos para la programación.';
        return of([]);
      })
    );
  }

  // NUEVA FUNCIÓN: Carga los detalles del partido por ID para mostrar los nombres de equipos
  loadPartidoDetalles(id: number): void {
      this.partidosService.getPartidoById(id).subscribe({
          next: (partido) => {
              this.partidoActual = partido;
              // Parcheamos el formulario de resultados con datos si existen
              if (partido.resultado_local !== null) {
                  this.resultadoForm.patchValue({
                      resultado_local: partido.resultado_local,
                      resultado_visitante: partido.resultado_visitante
                  });
              }
          },
          error: (err) => {
              this.errorMessage = err.error?.error || 'No se pudieron cargar los detalles del partido.';
              console.error('Error cargando detalles:', err);
          }
      });
  }


  // Función para validar que los IDs de los equipos sean diferentes
  equiposDiferentes(controlName1: string, controlName2: string) {
    return (formGroup: FormGroup) => {
      const control1 = formGroup.controls[controlName1];
      const control2 = formGroup.controls[controlName2];

      if (control1.value === control2.value && control1.value !== '') {
        control2.setErrors({ equiposIguales: true });
      } else {
        control2.setErrors(null);
      }
    };
  }
  
  // Función unificada para manejar la creación o actualización
  handleSubmit() {
    if (this.isUpdateMode) {
      this.actualizarResultado();
    } else {
      this.crearPartido();
    }
  }

  crearPartido() {
    if (this.partidoForm.invalid) {
      this.partidoForm.markAllAsTouched();
      return;
    }

    const formValue = this.partidoForm.value;
    const fechaHoraSQL = `${formValue.fecha_partido} ${formValue.hora_partido}`; 

    const nuevoPartido = {
      id_equipo_local: formValue.id_equipo_local,
      id_equipo_visitante: formValue.id_equipo_visitante,
      fecha_hora: fechaHoraSQL 
    };

    this.partidosService.createPartido(nuevoPartido).subscribe({
      next: (resp) => {
        console.log('Partido Programado:', resp);
        this.router.navigateByUrl('/partidos'); 
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al programar el partido.';
        console.error('Error al crear partido:', err);
      }
    });
  }

  actualizarResultado() {
    if (this.resultadoForm.invalid) {
      this.resultadoForm.markAllAsTouched();
      return;
    }

    const { resultado_local, resultado_visitante } = this.resultadoForm.value;

    this.partidosService.actualizarResultado(this.partidoId, resultado_local, resultado_visitante).subscribe({
        next: (resp) => {
            console.log('Resultado Actualizado:', resp);
            this.router.navigateByUrl('/partidos');
        },
        error: (err) => {
            this.errorMessage = err.error?.error || 'Error al actualizar el resultado.';
            console.error('Error al actualizar resultado:', err);
        }
    });
  }

  cancelar() {
    // CORRECCIÓN 2: Usamos el router público para navegar
    this.router.navigateByUrl('/partidos'); 
  }
}