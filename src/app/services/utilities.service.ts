import { Injectable } from '@angular/core';
import { FactusService } from './factus.service';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(private factusService: FactusService) { }

  downloadPDF(number: string) {
    this.factusService.fetchInvoicePDF(number).subscribe({
      next: (response) => {
        const { pdf_base_64_encoded } = response.data;
        const binary = atob(pdf_base_64_encoded);
        const arrayBuffer = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Modificar el nombre del archivo aquí
        const modifiedFilename = `Factura_${number}.pdf`;
        a.download = modifiedFilename;

        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar la factura:', error);
      },
    });
  }
  donwloadXML(number: string) {
    this.factusService.fetchInvoiceXML(number).subscribe({
      next: (response) => {
        const { xml_base_64_encoded } = response.data;
        const binary = atob(xml_base_64_encoded);
        const arrayBuffer = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          arrayBuffer[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([arrayBuffer], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Modificar el nombre del archivo aquí
        const modifiedFilename = `Factura_${number}.xml`;
        a.download = modifiedFilename;

        a.click();
        window.URL.revokeObjectURL(url);
      }, error: (error) => {
        console.error('Error al descargar la factura:', error);
      }
    })
  }
}
