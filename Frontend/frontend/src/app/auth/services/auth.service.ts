// frontend/src/app/auth/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; 

const base_url = 'http://localhost:3000/api/v1';

// Definición de las interfaces (deben coincidir con la respuesta del Backend)
interface UserData { id: number; nombre: string; rol: string; }
interface AuthResponse { token: string; user: UserData; }

// --- FUNCIÓN DE DECODIFICACIÓN JWT (GLOBAL) ---
function decodeToken(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
// --- FIN FUNCIÓN DE DECODIFICACIÓN ---


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // El constructor inyecta el HttpClient
  constructor(private http: HttpClient) { } 

  // --- 1. FUNCIÓN DE REGISTRO ---
  // Ahora espera 8 argumentos, incluyendo los dinámicos
  registro(
    nombre: string, 
    email: string, 
    password: string, 
    rol: string, 
    telefono_contacto: string, 
    ubicacion_ciudad: string, 
    codigo_seguridad: string, 
    fecha_nacimiento: string
  ): Observable<AuthResponse> {
    const url = `${base_url}/auth/registro`;
    
    // Envía todos los datos, aunque el Backend solo use algunos.
    return this.http.post<AuthResponse>(url, { 
      nombre, 
      email, 
      password, 
      rol,
      telefono_contacto,
      ubicacion_ciudad,
      codigo_seguridad,
      fecha_nacimiento
    });
  }

  // --- 2. FUNCIÓN DE LOGIN ---
  login(email: string, password: string): Observable<AuthResponse> {
    const url = `${base_url}/auth/login`;
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      tap(resp => {
        localStorage.setItem('token', resp.token);
      })
    );
  }
  
  //  FUNCIÓN AÑADIDA: Obtener datos del usuario desde el token JWT
  getUserDataFromToken(): { id: number, rol: string } | null {
    const token = this.getToken();
    if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.id && decoded.rol) {
            return { id: decoded.id, rol: decoded.rol };
        }
    }
    return null;
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