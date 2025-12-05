// frontend/src/app/components/equipos/services/equipos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';

const base_url = 'http://localhost:3000/api/v1/equipos';

// Interfaz para el modelo de Equipo
export interface Equipo {
    id_equipo?: number;
    id_torneo: number;
    nombre: string;
    contacto_capitan: string;
    telefono_capitan: string;
    pagado: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class EquiposService {

    private http = inject(HttpClient);
    private authService = inject(AuthService); // Inyectamos el servicio de autenticación

    // Función para obtener los Headers de Autorización con el token JWT
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Añadimos el token al Header
        });
    }

    // --- 1. FUNCIÓN LISTAR EQUIPOS (GET) ---
    getEquipos(idTorneo: number): Observable<Equipo[]> {
        const headers = this.getHeaders();
        return this.http.get<Equipo[]>(`${base_url}/torneo/${idTorneo}`, { headers });
    }

    // --- 2. FUNCIÓN CREAR EQUIPO (POST) <--- ¡IMPLEMENTACIÓN AGREGADA!
    createEquipo(equipo: Equipo): Observable<any> {
        const headers = this.getHeaders();
        // Nota: La ruta POST es solo la base_url porque la ruta de Node es '/'
        return this.http.post<any>(`${base_url}`, equipo, { headers });
    }

    // --- 3. FUNCIÓN EDITAR EQUIPO (PUT) ---
  updateEquipo(idEquipo: number, equipo: Equipo): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${base_url}/${idEquipo}`, equipo, { headers });
  }

  // --- 4. FUNCIÓN ELIMINAR EQUIPO (DELETE) ---
  deleteEquipo(idEquipo: number): Observable<any> {
    const headers = this.getHeaders();
    const base_url = 'http://localhost:3000/api/v1/equipos'; // Definir si no está global
    return this.http.delete(`${base_url}/${idEquipo}`, { headers });
  }
}