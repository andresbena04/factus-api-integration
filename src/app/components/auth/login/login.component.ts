import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  formLogin!: FormGroup;
  formDataLogin: any = {}
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.initializeForm()
  
  }
  private initializeForm(): void {
    this.formLogin = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.formLogin.setValue({
      username: 'sandbox@factus.com.co',
      password: 'sandbox2024%'
    })
  }
  // Método que se llama al hacer clic en el botón de login
  logIn(): void {
    this.loading = true;
    this.formDataLogin = this.formLogin.value;
    this.authService.getToken(this.formDataLogin).subscribe(
      (response) => {
        // Si la autenticación es exitosa, almacena el token
        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token);
        this.router.navigateByUrl('');
      },
      (error) => {
        this.alertService.invalidLogin()
        this.loading = false;
        console.error('Error de autenticación:', error);
      }
    );
  }
}
