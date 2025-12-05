// frontend/src/app/components/dashboard/pages/inicio/inicio.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

// CORRECCIÓN CLAVE: Importamos la clase correcta desde la ruta correcta
import { InicioComponent } from './inicio.component'; 

describe('InicioComponent', () => { // Corregido: Usamos el nombre de la clase
    // Usamos el tipo de clase correcto
    let component: InicioComponent; 
    let fixture: ComponentFixture<InicioComponent>; 

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // Usamos la clase correcta
            imports: [InicioComponent] 
        })
        .compileComponents();

        // Creamos el componente con la clase correcta
        fixture = TestBed.createComponent(InicioComponent); 
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});