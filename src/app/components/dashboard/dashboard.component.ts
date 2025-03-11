import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { RouterLink } from '@angular/router';
import { FactusService } from '../../services/factus.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../layout/sidebar/sidebar.component";
import { UtilitiesService } from '../../services/utilities.service';
import { NumberFormatterPipe } from '../../pipes/number-formatter.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule, SidebarComponent, NumberFormatterPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  invoices: any[] = []
  pages: any = {};
  currentPage: number = 1;
  InvoiceView: any = {}
  invoiceNumber: number | string = ''
  loading: boolean = false;
  private modalInvoice!: bootstrap.Modal
  constructor(
    private factusService: FactusService,
    private utilitiesService:UtilitiesService
  ) { }

  ngOnInit(): void {
    this.getInvoice()
    this.initializeModal()
  }
   // Inicializa los modales de Bootstrap
   private initializeModal(): void {
    this.modalInvoice = new window.bootstrap.Modal(
      document.getElementById('invoiceModal')!
    )
  }
  getInvoice(page: number = 1): void {
    this.loading = false
    this.factusService.getInvoice(page).subscribe({
      next: (response) => {
        console.log(response.data.data)
        this.loading = true
        this.invoices = response.data.data; // Ajuste según la estructura recibida
        this.pages = response.data.pagination; // Información de paginación
        this.currentPage = this.pages.current_page; // Página actual
      },
      error: (error) => {
        console.error('Error al obtener facturas:', error);
      }
    });
  }
  changePage(page: number): void {
    if (page >= 1 && page <= this.pages.last_page) {
      this.getInvoice(page);
    }
  }
  getPaginationButtons(): number[] {
    const totalPages = this.pages.last_page;
    const maxVisibleButtons = 10; // Máximo de botones visibles
    const buttons: number[] = [];
  
    if (totalPages <= maxVisibleButtons) {
      // Mostrar todas las páginas si son menos que el máximo
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Agregar siempre la primera página
      buttons.push(1);
  
      // Puntos suspensivos si el rango inicial está lejos
      if (this.currentPage > 5) {
        buttons.push(-1); // -1 representa "..."
      }
  
      // Calcular rango de páginas visibles alrededor de la página actual
      const start = Math.max(2, this.currentPage - 3);
      const end = Math.min(totalPages - 1, this.currentPage + 3);
  
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
  
      // Puntos suspensivos si el rango final está lejos
      if (this.currentPage < totalPages - 4) {
        buttons.push(-1); // -1 representa "..."
      }
  
      // Agregar siempre la última página
      buttons.push(totalPages);
    }
  
    return buttons;
  }
  
  
  viewInvoice(number:number | string): void {
    this.factusService.viewInvoice(number).subscribe({
      next: (response) => {
        this.modalInvoice.show()
        this.InvoiceView = response.data
      }, error: (error) => {
        console.error('Error al obtener factura:', error);
      }
    })
  } 
  getTotalPrice(): number {
    return this.InvoiceView?.items?.reduce((sum: number, item: any) => sum + item.total, 0) || 0;
  }
  downloadInvoicePDF(number: string): void {
    this.utilitiesService.downloadPDF(number)
  }
  downloadInvoiceXML(number: string): void {
    this.utilitiesService.donwloadXML(number)
  }
  

}
