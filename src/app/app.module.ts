import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { ConfirmDialogComponent } from './components/common/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from './components/common/empty-state/empty-state.component';
import { AccountFormDialogComponent } from './components/accounts/account-form-dialog/account-form-dialog.component';
import { ConfirmDialogModule } from './components/common/confirm-dialog/confirm-dialog.module';
import { EmptyStateModule } from './components/common/empty-state/empty-state.module';
import { RoomFormDialogComponent } from './components/rooms/room-form-dialog/room-form-dialog.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { StudentsModule } from './components/students/students.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    NavbarComponent,
    AccountsComponent,
    AccountFormDialogComponent,
    RoomFormDialogComponent,
    RoomsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ConfirmDialogModule,
    EmptyStateModule,
    StudentsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
