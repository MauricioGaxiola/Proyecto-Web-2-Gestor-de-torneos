// jugadores.spec.ts (Contenido corregido)
import { TestBed } from '@angular/core/testing';

// 1. CORRECCIÓN: Importamos la clase del servicio real
import { JugadoresService } from './jugadores.service'; 

// 2. CORRECCIÓN: Usamos el nombre correcto en el 'describe'
describe('JugadoresService', () => { 
  // 3. CORRECCIÓN: Definimos la variable 'service' como JugadoresService
  let service: JugadoresService; 

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // 4. CORRECCIÓN: Inyectamos el servicio con el nombre correcto
    service = TestBed.inject(JugadoresService); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});