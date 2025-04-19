import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

import { MaintenanceComponent } from './maintenance.component';
import { MaintenanceFormDialogComponent } from './maintenance-form-dialog/maintenance-form-dialog.component';
import { MaintenanceDetailDialogComponent } from './maintenance-detail-dialog/maintenance-detail-dialog.component';
import { ConfirmDialogModule } from '../common/confirm-dialog/confirm-dialog.module';
import { EmptyStateModule } from '../common/empty-state/empty-state.module';

@NgModule({
  declarations: [
    MaintenanceComponent,
    MaintenanceFormDialogComponent,
    MaintenanceDetailDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    ConfirmDialogModule,
    EmptyStateModule
  ],
  exports: [
    MaintenanceComponent
  ]
})
export class MaintenanceModule { }