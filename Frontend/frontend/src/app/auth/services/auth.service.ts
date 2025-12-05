// frontend/src/app/auth/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; 

// Define la URL base de tu Backend
const base_url = 'http://localhost:3000/api/v1/auth';

// Interfaces: definen la estructura de los datos que Angular recibirá del Backend
interface UserData { id: number; nombre: string; rol: string; }
interface AuthResponse { token: string; user: UserData; }

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // El constructor inyecta el HttpClient
  constructor(private http: HttpClient) { } 

  // --- 1. FUNCIÓN DE REGISTRO ---
  registro(nombre: string, email: string, password: string): Observable<AuthResponse> {
    const url = `${base_url}/registro`;
    // Llama al POST de tu API para crear un nuevo usuario
    return this.http.post<AuthResponse>(url, { nombre, email, password });
  }

  // --- 2. FUNCIÓN DE LOGIN ---
  login(email: string, password: string): Observable<AuthResponse> {
    const url = `${base_url}/login`;
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      // 'tap' se ejecuta si el login es exitoso
      tap(resp => {
        // Guardamos el token de seguridad JWT en el almacenamiento local
        localStorage.setItem('token', resp.token);
      })
    );
  }
  
  logout(): void {
    // Solo borramos el token de Local Storage
    localStorage.removeItem('token');
 }

  // Función para obtener el token (usado para autorizar peticiones protegidas)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

}