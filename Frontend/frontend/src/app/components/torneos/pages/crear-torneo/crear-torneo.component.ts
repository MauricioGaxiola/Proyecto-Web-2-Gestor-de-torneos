// frontend/src/app/components/torneos/pages/crear-torneo/crear-torneo.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const base_url = 'http://localhost:3000/api/v1/torneos'; // Usaremos la ruta directa

// Interfaz para la respuesta exitosa del Backend (debe coincidir con torneos.routes.js)
interface TorneoResponse {
    message: string;
    id: number;
    nombre: string; // <-- CRUCIAL: Debe existir en la respuesta del Backend
}

@Component({
  selector: 'app-crear-torneo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './crear-torneo.component.html',
  styleUrls: ['./crear-torneo.component.scss']
})
export class CrearTorneoComponent {

    private fb = inject(FormBuilder);
    public router = inject(Router);
    private http = inject(HttpClient); 
    
    public errorMessage: string = '';
    
    // Definición del formulario de Torneos
    public torneoForm: FormGroup = this.fb.group({
        nombre:          ['', [Validators.required, Validators.minLength(5)]],
        categoria:       ['', Validators.required],
        fecha_inicio:    ['', Validators.required],
        fecha_fin:       ['', Validators.required],
        costo_inscripcion: [0, [Validators.required, Validators.min(0)]],
        estado:          ['activo', Validators.required]
    });

    // Función que se ejecuta al enviar el formulario (POST)
    guardarTorneo() {
        if (this.torneoForm.invalid) {
            this.torneoForm.markAllAsTouched();
            return;
        }

        const nuevoTorneo = this.torneoForm.value;
        
        // El ID de usuario se obtiene del Token JWT
        const token = localStorage.getItem('token');
        
        // Creamos la petición manualmente con el token
        this.http.post<TorneoResponse>(base_url, nuevoTorneo, { headers: { Authorization: `Bearer ${token}` } }).subscribe({
            next: (resp) => { // resp es de tipo TorneoResponse
                console.log('Torneo Creado:', resp);
                
                // CORRECCIÓN: Usamos resp.nombre que el Backend debería devolver
                alert(`Torneo "${resp.nombre}" Creado con ID: ${resp.id}`); 
                
                // Éxito: Navegar al Listado de Equipos
                this.router.navigateByUrl('/equipos'); 
            },
            error: (err) => {
                this.errorMessage = err.error?.error || 'Error al guardar el torneo. Asegúrate de tener permisos.';
                console.error('Error al crear torneo:', err);
            }
        });
    }

    cancelar() {
        this.router.navigateByUrl('/dashboard');
    }
}