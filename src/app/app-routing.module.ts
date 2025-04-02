import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { StudentsComponent } from './components/students/students.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: 'accounts', component: AccountsComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'students', component: StudentsComponent },
      { path: '', redirectTo: 'accounts', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
