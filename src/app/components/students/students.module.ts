import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Cần nếu dùng form sau này
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog'; // Cần cho dialog
import { MatFormFieldModule } from '@angular/material/form-field'; // Cần cho dialog form
import { MatInputModule } from '@angular/material/input'; // Cần cho dialog form
import { MatSelectModule } from '@angular/material/select'; // Cần cho dialog form
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Cần cho loading
import { MatPaginatorModule } from '@angular/material/paginator'; // Cần cho phân trang
import { ConfirmDialogModule } from '../common/confirm-dialog/confirm-dialog.module'; // Cần cho confirm dialog
import { EmptyStateModule } from '../common/empty-state/empty-state.module'; // Cần cho empty state

import { StudentsComponent } from './students.component';
import { StudentFormDialogComponent } from './student-form-dialog/student-form-dialog.component'; // Import dialog mới

@NgModule({
  declarations: [
    StudentsComponent,
    StudentFormDialogComponent // Thêm dialog vào declarations
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // Cần nếu dùng form sau này
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule, // Cần cho dialog
    MatFormFieldModule, // Cần cho dialog form
    MatInputModule, // Cần cho dialog form
    MatSelectModule, // Cần cho dialog form
    MatProgressSpinnerModule, // Cần cho loading
    MatPaginatorModule, // Cần cho phân trang
    ConfirmDialogModule, // Cần cho confirm dialog
    EmptyStateModule // Cần cho empty state
  ],
  exports: [
    StudentsComponent // Export để module khác có thể dùng
  ]
})
export class StudentsModule { } 