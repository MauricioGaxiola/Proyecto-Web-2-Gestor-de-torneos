// frontend/src/app/auth/pages/login/login.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router'; // Añadir RouterModule para consistencia
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-login',
  standalone: true,
  // Asegúrate de que RouterModule esté importado si lo usas en el HTML
  imports: [ReactiveFormsModule, CommonModule, RouterModule], 
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.scss'] 
})
export class LoginComponent { 
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definición del formulario con validaciones
  public loginForm: FormGroup = this.fb.group({
    //  CORRECCIÓN: Eliminamos los valores predeterminados
    email:    ['', [Validators.required, Validators.email]], 
    //  VALIDACIÓN REFORZADA: Mínimo 6 caracteres
    password: ['', [Validators.required, Validators.minLength(6)]] 
  });
  
  public errorMessage: string = '';

  // Función que se ejecuta al enviar el formulario
  login() {
    // 1. Marcamos todos los campos como tocados para mostrar errores si es inválido
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (resp) => {
        // Éxito: Navegar al Dashboard
        this.router.navigateByUrl('/dashboard'); 
      },
      error: (err) => {
        // Error: Mostrar mensaje de error del Backend
        this.errorMessage = err.error?.error || 'Ocurrió un error desconocido al iniciar sesión.';
        console.error('Error de login:', err);
      }
    });
  }
}