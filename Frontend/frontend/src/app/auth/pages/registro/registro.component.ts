// frontend/src/app/auth/pages/registro/registro.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router'; // Importamos RouterModule para el enlace
import { CommonModule } from '@angular/common'; 
import { HttpErrorResponse } from '@angular/common/http'; // Para manejar errores

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule], // Añadimos RouterModule
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent { // <--- Clase esperada por el router
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definición del formulario con validaciones
  public registroForm: FormGroup = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]], 
    password: ['', [Validators.required, Validators.minLength(6)]],
    // Tarea futura: añadir confirmación de password si el tiempo lo permite
  });
  
  public errorMessage: string = '';

  // Función que se ejecuta al enviar el formulario
  registrar() {
    this.errorMessage = '';
    
    // Si el formulario es inválido, salimos
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    
    const { nombre, email, password } = this.registroForm.value;

    this.authService.registro(nombre, email, password).subscribe({
      next: (resp) => {
        // Éxito: Navegar al Login después de crear el usuario
        console.log('Registro exitoso:', resp);
        this.router.navigateByUrl('/auth/login'); 
      },
      error: (err: HttpErrorResponse) => {
        // Error: Mostrar mensaje de error del Backend (ej. Email ya registrado)
        this.errorMessage = err.error?.error || 'Ocurrió un error desconocido';
        console.error('Error de Registro:', err);
      }
    });
  }
}
