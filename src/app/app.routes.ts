import { Routes } from '@angular/router';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './helpers/auth.guard';
import { loginAccessGuard } from './helpers/login-access.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {path: 'emitir-factura', component:InvoiceFormComponent, canActivate:[authGuard]},
    {path: 'login', component:LoginComponent, canActivate:[loginAccessGuard]},
    { path: '**', component: DashboardComponent }
];
