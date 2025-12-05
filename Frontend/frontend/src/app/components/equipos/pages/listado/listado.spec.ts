// listado.spec.ts (Contenido corregido)
import { ComponentFixture, TestBed } from '@angular/core/testing';

// 1. CORRECCIÓN: Importamos la clase del componente real
import { ListadoComponent } from './listado.component'; 

// 2. CORRECCIÓN: Usamos el nombre correcto en el 'describe'
describe('ListadoComponent', () => { 
  // 3. CORRECCIÓN: Definimos las variables con el nombre correcto
  let component: ListadoComponent; 
  let fixture: ComponentFixture<ListadoComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 4. CORRECCIÓN: Usamos ListadoComponent
      imports: [ListadoComponent] 
    })
    .compileComponents();

    // 5. CORRECCIÓN: Creamos el componente ListadoComponent
    fixture = TestBed.createComponent(ListadoComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});