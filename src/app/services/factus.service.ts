import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; 
import { catchError, Observable, of, switchMap, throwError } from 'rxjs'; 
import { AuthService } from './auth/auth.service'; 

@Injectable({
  providedIn: 'root',
})
export class FactusService {
  private apiUrl = environment.apiUrl; // Define la URL base de la API desde las variables de entorno.

  constructor(private http: HttpClient, private authService: AuthService) {} 

  // Método para configurar encabezados con el token de autorización.
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json', // Indica que se espera una respuesta en formato JSON.
      Authorization: `Bearer ${token}`, // Añade el token de autenticación.
    });
  }

  // Método genérico para realizar solicitudes con token.
  private fetchWithToken<T>(endpoint: string, method: 'GET' | 'POST', body?: any): Observable<T> {
    const token = localStorage.getItem('access_token'); // Obtiene el token del almacenamiento local.
    if (!token) {
      throw new Error('No se encontró el token de autenticación'); // Lanza un error si no hay token.
    }

    const headers = this.getHeaders(token); // Configura los encabezados.

    // Realiza la solicitud HTTP según el método especificado.
    return (method === 'GET'
      ? this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers }) // Solicitud GET.
      : this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers }) // Solicitud POST.
    ).pipe(
      // Maneja posibles errores.
      catchError((error) => this.handleError(error, endpoint, method, body))
    );
  }

  // Maneja errores y realiza el proceso de refrescar el token si es necesario.
  private handleError(error: any, endpoint: string, method: 'GET' | 'POST', body?: any): Observable<any> {
    if (error.status === 401) { // Si el error es 401 (no autorizado).
      return this.authService.refreshToken().pipe( // Intenta refrescar el token.
        switchMap((response) => {
          if (response?.access_token) { // Si se obtiene un nuevo token.
            localStorage.setItem('access_token', response.access_token); // Almacena el nuevo token.
            return this.retryRequest(response.access_token, endpoint, method, body); // Reintenta la solicitud original con el nuevo token.
          } else {
            throw new Error('No se pudo refrescar el token'); // Lanza un error si no se obtiene el token.
          }
        })
      );
    }
    return throwError(() => error); // Si el error no es 401, lo pasa directamente.
  }

  // Reintenta la solicitud original con un nuevo token.
  private retryRequest<T>(newToken: string, endpoint: string, method: 'GET' | 'POST', body?: any): Observable<T> {
    const headers = this.getHeaders(newToken); // Configura los encabezados con el nuevo token.
    return method === 'GET'
      ? this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers }) // Reintenta GET.
      : this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers }); // Reintenta POST.
  }

  // Métodos específicos para consumir endpoints de la API.
  
  // Obtiene la lista de municipios.
  getMunicipalities(): Observable<any> {
    return this.fetchWithToken('/v1/municipalities', 'GET');
  }

  // Obtiene las unidades de medida.
  getMeasurementUnits(): Observable<any> {
    return this.fetchWithToken('/v1/measurement-units', 'GET');
  }

  // Obtiene los impuestos aplicables a productos.
  getProductTaxes(): Observable<any> {
    return this.fetchWithToken('/v1/tributes/products', 'GET');
  }

  // Genera una factura con los datos proporcionados.
  generateInvoice(invoiceData: any): Observable<any> {
    return this.fetchWithToken('/v1/bills/validate', 'POST', invoiceData);
  }

  // Obtiene una lista paginada de facturas.
  getInvoice(page: number = 1): Observable<any> {
    return this.fetchWithToken(`/v1/bills?page=${page}`, 'GET');
  }

  // Obtiene el rango de numeración disponible para facturas.
  getNumberRange(): Observable<any> {
    return this.fetchWithToken('/v1/numbering-ranges', 'GET');
  }

  // Descarga el PDF de una factura específica.
  fetchInvoicePDF(number: string): Observable<any> {
    return this.fetchWithToken(`/v1/bills/download-pdf/${number}`, 'GET');
  }
  // Descarga el PDF de una factura específica.
  fetchInvoiceXML(number: string): Observable<any> {
    return this.fetchWithToken(`/v1/bills/download-xml/${number}`, 'GET');
  }

  // Muestra los detalles de una factura específica.
  viewInvoice(number: number | string): Observable<any> {
    return this.fetchWithToken(`/v1/bills/show/${number}`, 'GET');
  }
}
