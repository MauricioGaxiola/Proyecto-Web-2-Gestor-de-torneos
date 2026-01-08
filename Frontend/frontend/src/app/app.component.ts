import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Asegúrate que el archivo se llame así
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  public showNavbar: boolean = true;
  public userName: string = 'Invitado'; 
  public currentRouteName: string = 'Inicio'; 

  ngOnInit(): void {
    this.checkRoute();
    this.getUserData();
  }

  checkRoute() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Si la URL contiene /auth/, ocultamos el sidebar
      this.showNavbar = !event.urlAfterRedirects.includes('/auth/');
      this.updateBreadcrumb(event.urlAfterRedirects);
    });
  }

  getUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user.nombre || 'Invitado';
  }

  updateBreadcrumb(url: string) {
    if (url.includes('torneos')) this.currentRouteName = 'Torneos';
    else if (url.includes('partidos')) this.currentRouteName = 'Partidos';
    else if (url.includes('equipos')) this.currentRouteName = 'Equipos';
    else if (url.includes('dashboard')) this.currentRouteName = 'Dashboard';
    else this.currentRouteName = 'Inicio';
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}