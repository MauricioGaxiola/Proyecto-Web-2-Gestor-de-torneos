// frontend/src/app/auth/pages/login/login.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para usar directivas

@Component({
  selector: 'app-login',
  standalone: true,
  // ¡Importar los módulos necesarios para el formulario!
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './login.component.html', // <--- Asume que tu HTML se llama login.component.html
  styleUrls: ['./login.component.scss'] // <--- Asume que tu CSS se llama login.component.scss
})
export class LoginComponent { // <--- CLASE CORREGIDA (EXPORT Y NOMBRE)
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definición del formulario con validaciones
  public loginForm: FormGroup = this.fb.group({
    email:    ['m.org@torneo.com', [Validators.required, Validators.email]], 
    password: ['mipasswordseguro', [Validators.required, Validators.minLength(6)]] 
  });
  
  public errorMessage: string = '';

  // Función que se ejecuta al enviar el formulario
  login() {
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (resp) => {
        // Éxito: Navegar al Dashboard
        this.router.navigateByUrl('/dashboard'); 
      },
      error: (err) => {
        // Error: Mostrar mensaje de error del Backend
        this.errorMessage = err.error.error || 'Ocurrió un error desconocido';
      }
    });
  }
}