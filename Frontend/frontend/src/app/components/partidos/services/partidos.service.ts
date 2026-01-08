// frontend/src/app/components/partidos/services/partidos.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// Asume que la ruta al servicio de autenticación es correcta:
import { AuthService } from '../../../auth/services/auth.service'; 

// URL BASE DEL BACKEND (Consistente con los otros servicios)
const base_url = 'http://localhost:3000/api/v1';

// Interfaz del Partido (Modelo de Datos)
export interface Partido {
  id_partido?: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha_hora: string; // Formato YYYY-MM-DD HH:MM:SS
  resultado_local?: number | null; 
  resultado_visitante?: number | null; 
  nombre_local?: string;
  nombre_visitante?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartidosService {

  private http = inject(HttpClient);
  private authService = inject(AuthService); 

  // Función para obtener los Headers de Autorización con el token JWT
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  // --- 1. Método: Crear Partido (POST) ---
  createPartido(partido: Partido): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${base_url}/partidos`, partido, { headers }); 
  }

  // --- 2. Método: Obtener Todos los Partidos (GET) ---
  getPartidos(): Observable<Partido[]> {
    const headers = this.getHeaders();
    return this.http.get<Partido[]>(`${base_url}/partidos`, { headers }); 
  }
  
  // --- 3. Método: Obtener Partido por ID (GET Detalle) ---
  getPartidoById(idPartido: number): Observable<Partido> {
    const headers = this.getHeaders();
    return this.http.get<Partido>(`${base_url}/partidos/${idPartido}`, { headers });
  }

  // --- 4. Método: Actualizar Resultado (PUT) ---
  actualizarResultado(idPartido: number, resultadoLocal: number, resultadoVisitante: number): Observable<any> {
    const headers = this.getHeaders();
    const body = {
      resultado_local: resultadoLocal,
      resultado_visitante: resultadoVisitante
    };
    return this.http.put(`${base_url}/partidos/resultado/${idPartido}`, body, { headers }); 
  }

  // --- 5. Método: Obtener Tabla de Posiciones (NUEVO MÉTODO) ---
  getTablaPosiciones(idTorneo: number): Observable<any[]> {
      const headers = this.getHeaders();
      // Llama a la nueva ruta GET /api/v1/partidos/tabla/:idTorneo
      return this.http.get<any[]>(`${base_url}/partidos/tabla/${idTorneo}`, { headers });
  }

  // --- 6. Método: Obtener Goleadores (NUEVO MÉTODO) ---
getGoleadores(idTorneo: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${base_url}/partidos/goleadores/${idTorneo}`, { headers });
  }
}