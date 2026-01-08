// frontend/src/app/auth/pages/registro/registro.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public errorMessage: string = '';
  public rolSeleccionado: string = ''; 

  // --- FORMULARIO BLINDADO ---
  public registroForm: FormGroup = this.fb.group({
    nombre:            ['', [Validators.required, Validators.minLength(3)]],
    email:             ['', [Validators.required, Validators.email]],
    password:          ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]], //  Nuevo campo
    rol:               ['', Validators.required], 
    
    // CAMPOS DINÁMICOS
    telefono_contacto:  [''],
    ubicacion_ciudad:   ['', [Validators.minLength(3)]],
    codigo_seguridad:   [''], 
    fecha_nacimiento:   [''],
  }, {
    //  VALIDADOR PERSONALIZADO DE CONTRASEÑAS
    validators: this.passwordsMatchValidator 
  });

  constructor() {
    this.setupRolListener();
  }

  // Lógica del validador de coincidencia
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmarPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Seteamos el error manualmente en el campo de confirmación
      confirmPassword.setErrors({ noMatch: true });
      return { passwordsNotMatching: true };
    }
    return null;
  }

  setupRolListener(): void {
    this.registroForm.get('rol')?.valueChanges.subscribe(rol => {
      this.rolSeleccionado = rol;
      
      const telefonoControl = this.registroForm.get('telefono_contacto');
      const ciudadControl = this.registroForm.get('ubicacion_ciudad');
      const codigoControl = this.registroForm.get('codigo_seguridad');
      const fechaNacimientoControl = this.registroForm.get('fecha_nacimiento');

      // Limpiamos validaciones
      [telefonoControl, ciudadControl, codigoControl, fechaNacimientoControl].forEach(control => {
        control?.clearValidators();
        control?.setValue('');
      });

      if (rol === 'organizador') {
        telefonoControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8,15}$')]);
        ciudadControl?.setValidators([Validators.required, Validators.minLength(3)]);
        codigoControl?.setValidators([Validators.required, Validators.minLength(4)]);
        
      } else if (rol === 'jugador') {
        fechaNacimientoControl?.setValidators([Validators.required]);
      }
      
      // Actualizamos validez
      [telefonoControl, ciudadControl, codigoControl, fechaNacimientoControl].forEach(control => {
        control?.updateValueAndValidity();
      });
    });
  }

  registrar() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    // Nota: enviamos solo los datos que el backend espera
    const { nombre, email, password, rol, telefono_contacto, ubicacion_ciudad, codigo_seguridad, fecha_nacimiento } = this.registroForm.value;

    this.authService.registro(nombre, email, password, rol, telefono_contacto, ubicacion_ciudad, codigo_seguridad, fecha_nacimiento).subscribe({
      next: (resp) => {
        // Cambiamos el alert por un mensaje más profesional en consola o podrías usar un Toast
        this.router.navigateByUrl('/auth/login');
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al registrar el usuario.';
        console.error('Error de registro:', err);
      }
    });
  }
}