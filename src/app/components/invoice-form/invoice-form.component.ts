import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FactusService } from '../../services/factus.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { AlertService } from '../../services/alert.service';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SidebarComponent, RouterLink],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.css'
})
export class InvoiceFormComponent {
  // Formulario de factura
  invoiceForm!: FormGroup;
  // Listas para los datos de municipios, unidades de medida, impuestos de productos y rangos de numeración
  municipalities: any[] = [];
  measurementUnits: any[] = [];
  productTaxes: any[] = [];
  numberRange: any[] = [];
  formProducts!: FormGroup;
  loading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private factusService: FactusService,
    private alertService: AlertService
  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  // Inicializa el formulario de la factura
  private initializeForm(): void {
    this.invoiceForm = this.fb.group({
      names: ['', [Validators.required, Validators.pattern("[ a-zA-ZáéíóúÁÉÍÓÚüÜ]+$")]],
      email: ['', [Validators.required, Validators.email]],
      identification_document_id: ['', Validators.required],
      identification: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      dv: [''],
      municipality_id: ['', Validators.required],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
      legal_organization_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      payment_form: ['', Validators.required],
      payment_method_code: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
      reference_code: ['', Validators.required],
      tribute_id: ['', Validators.required],
      payment_due_date: [''],
      numbering_range_id: ['', Validators.required],
    });

    // Establece validadores dinámicos basados en ciertos valores
    this.setValidatorsOnValueChange();
  }

  // Establece validadores dinámicos en base al valor de ciertos controles
  private setValidatorsOnValueChange(): void {
    this.setDynamicValidators('identification_document_id', 'dv', '6');
    this.setDynamicValidators('payment_form', 'payment_due_date', '2');
  }

  // Configura validadores dinámicos dependiendo del valor de un control
  private setDynamicValidators(controlName: string, dependentControlName: string, conditionValue: string): void {
    this.invoiceForm.get(controlName)?.valueChanges.subscribe(value => {
      const control = this.invoiceForm.get(dependentControlName);
      // Si el valor coincide con el valor de condición, el control dependiente será requerido
      value === conditionValue ? control?.setValidators([Validators.required]) : control?.clearValidators();
      control?.updateValueAndValidity();  // Actualiza la validez del control
    });
  }

  // Obtiene la lista de ítems de la factura
  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  // Crea un nuevo ítem vacío para la factura
  createItem(): FormGroup {
    return this.fb.group({
      code_reference: ['', Validators.required],
      name: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      unit_measure_id: ['', Validators.required],  // Unidad de medida
      discount_rate: ['', Validators.required],  // Tasa de descuento
      tax_rate: ['', Validators.required],
      is_excluded: ['', Validators.required],
      standard_code_id: ['', Validators.required],  // Código estándar
      tribute_id: ['', Validators.required],  // ID del tributo
    });
  }

  // Agrega un ítem al formulario
  addItem(): void {
    this.items.push(this.createItem());
  }

  // Elimina un ítem del formulario
  removeItem(i: number): void {
    this.items.removeAt(i);
  }

  // Método que se ejecuta cuando se envía el formulario
  onSubmit(): void {
    this.loading = true;

    const invoice = this.buildInvoiceData();  // Construir los datos de la factura
    
    this.factusService.generateInvoice(invoice).subscribe({
      next: (res) => {
        let invoiceNumberMessage = res.data.bill.number
        this.loading = false;
        this.invoiceForm.reset()
        this.alertService.successAlert(invoiceNumberMessage)
        console.log(res)
      },
      error: (err) => {
        this.alertService.errorAlert();
        this.loading = false;
        console.error(err);
      }
    });

  }

  // Construye los datos para la factura
  private buildInvoiceData(): any {
    const customer = this.invoiceForm.value;
    const billing_period = this.buildBillingPeriod();
    const items = this.items.value.map((item: any) => this.mapItemData(item))  // Mapea los ítems

    return { customer, billing_period, items, ...this.invoiceForm.value };
  }

  // Construye el periodo de facturación (fecha y hora de inicio y fin)
  private buildBillingPeriod(): any {
    const { start_date, start_time, end_date, end_time } = this.invoiceForm.value;
    return {
      start_date,
      start_time: `${start_time}:00`,  // Formatea la hora
      end_date,
      end_time: `${end_time}:00`,  // Formatea la hora
    };
  }

  // Mapea los datos de un ítem
  private mapItemData(item: any): any {
    return { ...item };  // Devuelve una copia del ítem
  }

  // Carga los datos necesarios desde el servicio
  private loadData(): void {
    setTimeout(() => {
      this.getMunicipalities();
      this.getMeasurementUnits();
      this.getProductTaxes();
      this.getNumberRange();
    }, 500);
  }

  // Obtiene los municipios desde el servicio
  getMunicipalities(): void {
    this.factusService.getMunicipalities().subscribe(
      {
        next: (response) => {
          this.municipalities = response.data.sort((a: any, b: any) => {
            return a.name.localeCompare(b.name);  // Ordena los municipios por nombre
          });
        }, error: (error) => {
          console.error('Error al obtener municipios:', error);
        }
      }
    );
  }

  // Obtiene las unidades de medida desde el servicio
  getMeasurementUnits(): void {
    this.factusService.getMeasurementUnits().subscribe({
      next: (response) => {
        this.measurementUnits = response.data;
      }, error: (error) => {
        console.error('Error al obtener unidades de medida:', error);
      }
    });
  }

  // Obtiene los impuestos de productos desde el servicio
  getProductTaxes(): void {
    this.factusService.getProductTaxes().subscribe({
      next: (response) => {
        this.productTaxes = response.data;
      }, error: (error) => {
        console.error('Error al obtener impuestos de productos:', error);
      }
    });
  }

  // Obtiene los rangos de numeración desde el servicio
  getNumberRange(): void {
    this.factusService.getNumberRange().subscribe({
      next: (response) => {
        this.numberRange = response.data;
      }, error: (error) => {
        console.error('Error al obtener rangos de numeración:', error);
      }
    });
  }

  
}
