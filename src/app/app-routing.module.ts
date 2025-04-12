import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { StudentsComponent } from './components/students/students.component';

// Import functional guards
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { adminGuard } from './guards/admin.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';

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
      { path: 'dashboard', component: AccountsComponent }, // Tạm thời dùng AccountsComponent làm dashboard
      { path: 'accounts', component: AccountsComponent, canActivate: [adminGuard] },
      { path: 'rooms', component: RoomsComponent, canActivate: [adminGuard] },
      { path: 'students', component: StudentsComponent },
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
