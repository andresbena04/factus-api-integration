import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormatter',
  standalone: true
})
export class NumberFormatterPipe implements PipeTransform {

  transform(value: number | string, currencySymbol: string = '$'): string {
    // Convierte el valor a número y elimina los decimales
    const num = Math.trunc(Number(value));
    
    // Formatea con separadores de miles
    const formattedNumber = num.toLocaleString('es-CO'); 
    
    // Retorna el número formateado con el símbolo de moneda
    return `${currencySymbol}${formattedNumber}`;
  }
}
