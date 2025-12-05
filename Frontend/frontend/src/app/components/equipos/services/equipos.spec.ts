// equipos.spec.ts (Contenido corregido)
import { TestBed } from '@angular/core/testing';

// 1. CORRECCIÓN: Importamos la clase del servicio real
import { EquiposService } from './equipos.service'; 

// 2. CORRECCIÓN: Usamos el nombre correcto en el 'describe'
describe('EquiposService', () => { 
  // 3. CORRECCIÓN: Definimos la variable 'service' como EquiposService
  let service: EquiposService; 

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // 4. CORRECCIÓN: Inyectamos el servicio con el nombre correcto
    service = TestBed.inject(EquiposService); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});