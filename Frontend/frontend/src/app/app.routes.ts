// frontend/src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';

// Importación del AuthGuard
import { authGuard } from './auth/guards/auth.guard'; 

// Componentes de Equipos
import { ListadoComponent as EquiposListado } from './components/equipos/pages/listado/listado.component';
import { CrearComponent as EquiposCrear } from './components/equipos/pages/crear/crear.component';

// Componentes de Jugadores
import { ListadoJugadoresComponent } from './components/jugadores/pages/listado-jugadores/listado-jugadores.component';
import { CrearJugadorComponent } from './components/jugadores/pages/crear-jugador/crear-jugador.component';

// Componentes de Partidos 
import { ListadoComponent as PartidosListado } from './components/partidos/pages/listado/listado.component';
import { CrearPartidoComponent } from './components/partidos/pages/crear-partido/crear-partido.component';
import { TablaPosicionesComponent } from './components/partidos/pages/tabla-posiciones/tabla-posiciones.component'; 

// Componentes de Torneos
import { CrearTorneoComponent } from './components/torneos/pages/crear-torneo/crear-torneo.component'; 
import { ListadoComponent as TorneosListado } from './components/torneos/pages/listado/listado.component'; 

//  NUEVA IMPORTACIÓN: Recuperar Contraseña
import { ForgotPasswordComponent } from './auth/pages/forgot-password/forgot-password.component';


export const routes: Routes = [
    // Rutas públicas (Login/Registro/Recuperar)
    {
        path: 'auth/login',
        component: LoginComponent 
    },
    {
        path: 'auth/registro',
        loadComponent: () => import('./auth/pages/registro/registro.component').then(m => m.RegistroComponent)
    },
    {
        //  RUTA AÑADIDA: Recuperar Contraseña
        path: 'auth/forgot-password',
        component: ForgotPasswordComponent
    },
    
    // =============================================================
    // RUTAS PRIVADAS (Requieren Login/Token)
    // =============================================================
    
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/pages/inicio/inicio.component').then(m => m.InicioComponent),
        canActivate: [authGuard] 
    },
    
    // RUTAS DE TORNEOS
    {
        path: 'torneos', 
        component: TorneosListado,
        canActivate: [authGuard] 
    },
    {
        path: 'torneos/crear', 
        component: CrearTorneoComponent,
        canActivate: [authGuard] 
    },
    
    // RUTAS DE PARTIDOS
    {
        path: 'partidos', 
        component: PartidosListado,
        canActivate: [authGuard] 
    },
    {
        path: 'partidos/crear', 
        component: CrearPartidoComponent,
        canActivate: [authGuard] 
    },
    {
        path: 'partidos/actualizar/:id', 
        component: CrearPartidoComponent,
        canActivate: [authGuard] 
    },
    {
        path: 'partidos/tabla', 
        component: TablaPosicionesComponent,
        canActivate: [authGuard] 
    },

    // Rutas Anidadas para Equipos y Jugadores
    {
        path: 'equipos',
        canActivate: [authGuard], 
        children: [
            {
                path: '',
                redirectTo: '/torneos', 
                pathMatch: 'full'
            },
            {
                path: ':idTorneo', 
                component: EquiposListado,
            },
            {
                path: 'crear/:idTorneo', 
                component: EquiposCrear,
            },
            {
                path: 'editar/:id', 
                component: EquiposCrear,
            },
            
            // RUTAS DE JUGADORES
            {
                path: ':idEquipo/jugadores', 
                component: ListadoJugadoresComponent,
            },
            {
                path: ':idEquipo/jugadores/crear', 
                component: CrearJugadorComponent,
            },
            {
                //  RUTA AÑADIDA: Editar Jugador (Reutiliza el componente de crear)
                path: ':idEquipo/jugadores/editar/:id', 
                component: CrearJugadorComponent,
            },
        ]
    },

    // Ruta por defecto y 404
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'auth/login',
    }
];