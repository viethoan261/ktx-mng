import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { StudentsComponent } from './components/students/students.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SecurityComponent } from './components/security/security.component';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { PricesComponent } from './components/prices/prices.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PaymentResultComponent } from './components/payment-result/payment-result.component';

// Import functional guards
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { adminGuard } from './guards/admin.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RequestsComponent } from './components/requests/requests.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard] // Sử dụng functional guard
  },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard], // Sử dụng functional guard
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { 
        path: 'accounts', 
        component: AccountsComponent,
        canActivate: [adminGuard]
      },
      { path: 'rooms', component: RoomsComponent },
      { path: 'students', component: StudentsComponent },
      { 
        path: 'maintenance',
        component: MaintenanceComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'security',
        component: SecurityComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'prices',
        component: PricesComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'orders',
        component: OrdersComponent
      },
      { path: 'payment-result', component: PaymentResultComponent },
      { path: 'requests', component: RequestsComponent },
      { 
        path: 'notifications', 
        component: NotificationsComponent
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // Wildcard route - mọi route không khớp sẽ chuyển về login
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
