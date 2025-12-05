// login.spect.ts (Contenido corregido)
import { ComponentFixture, TestBed } from '@angular/core/testing';

// 1. CORRECCIÓN: Importamos LoginComponent
import { LoginComponent } from './login.component'; 

describe('LoginComponent', () => {
  // 2. CORRECCIÓN: Definimos la variable como LoginComponent
  let component: LoginComponent; 
  // 3. CORRECCIÓN: Definimos el fixture con LoginComponent
  let fixture: ComponentFixture<LoginComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 4. CORRECCIÓN: Usamos LoginComponent
      imports: [LoginComponent] 
    })
    .compileComponents();

    // 5. CORRECCIÓN: Creamos el componente LoginComponent
    fixture = TestBed.createComponent(LoginComponent); 
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});