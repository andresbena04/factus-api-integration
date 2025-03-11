import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  let authReq = req;
  const token = authService.getAccessToken();  // Accede al token de acceso
  
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log("Interceptor", error.error); // Muestra el error completo para ayudar en el diagnóstico
  
      // Verifica si el error tiene la estructura esperada y si es un error 401
      if (error.status === 401) {
        // Verifica si la descripción del error indica que el refresh token es inválido
        if (error.error && error.error.error_description === 'The refresh token is invalid.') {
          authService.logout();  // Cierra la sesión del usuario
          router.navigate(['/login']);  // Redirige a la página de login
          Swal.fire("Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
          return throwError(() => new Error('Refresh token invalid'));  // Lanza un nuevo error
        }
        
        // Maneja el caso en que el usuario no está autenticado (no hay sesión válida)
        if (error.error && error.error.message === 'Unauthenticated.') {
          authService.logout();  // Cierra la sesión del usuario
          router.navigate(['/login']);  // Redirige a la página de login
          Swal.fire("Tu sesión ha caducado. Por favor, inicia sesión nuevamente.");
          return throwError(() => new Error('User is unauthenticated'));  // Lanza un nuevo error
        }
      }
  
      // Si el error no es ninguno de los casos anteriores, simplemente lanza el error original
      return throwError(() => error);
    })
  );
  
};
