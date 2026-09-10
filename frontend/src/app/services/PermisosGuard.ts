import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

/**
 * PermisosGuard
 * Protege todas las rutas internas (/routes/*) en base al tipo de usuario,
 * la flag isAdmin y la lista de módulos asignados en USERS_PERMISOS.
 *
 * Reglas:
 *   - CLIENTES → redirigidos siempre a /manza/config/ (sin acceso a /routes)
 *   - ADMIN    → pase libre a todo el sistema
 *   - soloAdmin → solo el administrador puede acceder (ej: /routes/master/usuarios)
 *   - permiso  → el usuario debe tener ese módulo en su lista de permisos
 */
@Injectable({ providedIn: 'root' })
export class PermisosGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      this.router.navigate(['/pages/login']);
      return false;
    }

    const user = JSON.parse(userStr);
    console.log(user);

    const tipo: string = user.tipo || 'interno';
    const isAdmin: boolean = user.isAdmin === true;
    const permisos: string[] = user.permisos || [];
    const permisoRequerido: string = route.data['permiso'];
    const soloAdmin: boolean = route.data['soloAdmin'] === true;

    // REGLA 1: Clientes → acceso bloqueado a /routes/*
    if (tipo === 'cliente') {
      this.router.navigate(['/manza/config/']);
      return false;
    }

    // REGLA 2: Administrador → pase libre
    if (isAdmin) {
      return true;
    }

    // REGLA 3: Ruta exclusiva de administrador
    if (soloAdmin) {
      this.router.navigate(['/manza/config/']);
      return false;
    }

    // REGLA 4: Sin permiso específico requerido → ruta común para empleados
    if (!permisoRequerido) {
      return true;
    }

    // REGLA 5: Comprobar permiso en la lista del usuario
    if (permisos.includes(permisoRequerido)) {
      return true;
    }

    // Sin permiso → devolver al configurador
    this.router.navigate(['/manza/config/']);
    return false;
  }
}
