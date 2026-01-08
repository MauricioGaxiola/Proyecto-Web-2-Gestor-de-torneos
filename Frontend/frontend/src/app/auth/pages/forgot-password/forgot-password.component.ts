import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser'; 

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public step: number = 1; 
  public cargando: boolean = false;
  public errorMessage: string = '';
  private codigoGenerado: string = ''; 

  public emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public resetForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  async enviarCodigo() {
    if (this.emailForm.invalid) return;

    this.cargando = true;
    this.errorMessage = '';

    // Generamos código aleatorio
    this.codigoGenerado = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Código de respaldo:', this.codigoGenerado);

    const templateParams = {
      to_email: this.emailForm.value.email,
      nombre: 'Usuario',
      codigo: this.codigoGenerado
    };

    try {
      //  AQUÍ PEGAS TUS LLAVES 
      await emailjs.send(
        'service_x9s',      //  PEGA AQUÍ TU SERVICE ID
        'template_p7q6b61',     //  PEGA AQUÍ TU TEMPLATE ID
        templateParams,
        'QENKA4lwrICbG4ldk'        //  PEGA AQUÍ TU PUBLIC KEY
      );

      this.cargando = false;
      this.step = 2;
      alert('¡Código enviado a tu correo!');

    } catch (error) {
      console.error('Error al enviar:', error);
      this.cargando = false;
      this.errorMessage = 'Error al enviar el correo. Revisa la consola.';
    }
  }

  cambiarPassword() {
    if (this.resetForm.invalid) return;

    const { codigo, password, confirmPassword } = this.resetForm.value;

    if (codigo !== this.codigoGenerado) {
      this.errorMessage = 'El código es incorrecto.';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    // Simulación de guardado
    setTimeout(() => {
      this.cargando = false;
      alert('¡Contraseña actualizada correctamente!');
      this.router.navigateByUrl('/auth/login');
    }, 1500);
  }
}