// frontend/src/app/components/torneos/services/torneos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';

const base_url = 'http://localhost:3000/api/v1/torneos'; // RUTA DE TORNEOS

// Definición de la Interfaz Torneo (debe coincidir con la DB)
export interface Torneo {
  id_torneo?: number;
  nombre: string;
  categoria: string;
  fecha_inicio: string;
  fecha_fin: string;
  costo_inscripcion: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class TorneosService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  // 1. Método: Obtener Todos (R)
  getTorneos(): Observable<Torneo[]> {
    const headers = this.getHeaders();
    return this.http.get<Torneo[]>(base_url, { headers });
  }
  
  //  MÉTODO AÑADIDO: Crear un nuevo torneo (C)
  createTorneo(torneoData: Torneo): Observable<any> {
    const headers = this.getHeaders();
    // Usa el método POST para enviar los datos al backend
    return this.http.post<any>(base_url, torneoData, { headers });
  }


  // 2. Método: Obtener un torneo por su ID (R)
  getTorneoById(idTorneo: number): Observable<Torneo> {
    const headers = this.getHeaders();
    return this.http.get<Torneo>(`${base_url}/${idTorneo}`, { headers });
  }

  // 3. Método: Eliminar (D)
  deleteTorneo(idTorneo: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${base_url}/${idTorneo}`, { headers });
  }
}