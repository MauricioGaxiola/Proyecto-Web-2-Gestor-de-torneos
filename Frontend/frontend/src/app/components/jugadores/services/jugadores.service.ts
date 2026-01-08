// frontend/src/app/components/jugadores/services/jugadores.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';

const base_url = 'http://localhost:3000/api/v1/jugadores';

export interface Jugador {
  id_jugador?: number;
  id_equipo: number;
  nombre: string;
  posicion: string;
  fecha_nacimiento: string;
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

  getJugadoresPorEquipo(idEquipo: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${base_url}/equipo/${idEquipo}`, { headers: this.getHeaders() });
  }

  //  NUEVA: Obtener un solo jugador para editar
  getJugadorById(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${base_url}/${id}`, { headers: this.getHeaders() });
  }

  createJugador(jugador: Jugador): Observable<any> {
    return this.http.post<any>(`${base_url}`, jugador, { headers: this.getHeaders() });
  }

  //  NUEVA: Actualizar jugador (PUT)
  updateJugador(id: number, jugador: Jugador): Observable<any> {
    return this.http.put<any>(`${base_url}/${id}`, jugador, { headers: this.getHeaders() });
  }

  deleteJugador(idJugador: number): Observable<any> {
    return this.http.delete(`${base_url}/${idJugador}`, { headers: this.getHeaders() });
  }
}