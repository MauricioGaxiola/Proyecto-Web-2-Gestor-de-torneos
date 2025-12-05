// frontend/src/app/components/jugadores/services/jugadores.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service'; // RUTA RELATIVA

const base_url = 'http://localhost:3000/api/v1/jugadores';

// Interfaz para el modelo de Jugador
export interface Jugador {
  id_jugador?: number;
  id_equipo: number;
  nombre: string;
  posicion: string;
  fecha_nacimiento: string; // Formato YYYY-MM-DD
}

@Injectable({
  providedIn: 'root'
})
export class JugadoresService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  // --- 1. FUNCIÓN LISTAR JUGADORES POR EQUIPO (GET) ---
  getJugadoresPorEquipo(idEquipo: number): Observable<Jugador[]> {
    const headers = this.getHeaders();
    return this.http.get<Jugador[]>(`${base_url}/equipo/${idEquipo}`, { headers });
  }

  // --- 2. FUNCIÓN CREAR JUGADOR (POST) ---
  createJugador(jugador: Jugador): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${base_url}`, jugador, { headers });
  }
}