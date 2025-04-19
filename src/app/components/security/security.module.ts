import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SecurityComponent } from './security.component';
import { SecurityFormDialogComponent } from './security-form-dialog/security-form-dialog.component';
import { SecurityDetailDialogComponent } from './security-detail-dialog/security-detail-dialog.component';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Thêm import các module Material còn thiếu
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    SecurityComponent,
    SecurityFormDialogComponent,
    SecurityDetailDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: SecurityComponent }]),
    // Material modules
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatDividerModule,
    MatListModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Thêm schema để tránh lỗi với các thẻ không được nhận diện
})
export class SecurityModule { } 