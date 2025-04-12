import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-student-form-dialog',
  templateUrl: './student-form-dialog.component.html',
  styleUrls: ['./student-form-dialog.component.scss']
})
export class StudentFormDialogComponent implements OnInit {
  studentForm!: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student?: Student }
  ) {
    this.isEditMode = !!data?.student;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.studentForm = this.fb.group({
      fullname: [this.data?.student?.fullname || '', Validators.required],
      email: [this.data?.student?.email || '', [Validators.required, Validators.email]],
      phone: [this.data?.student?.phone || '', Validators.required]
    });

    // Nếu là chế độ tạo mới, thêm trường username và mật khẩu
    if (!this.isEditMode) {
      this.studentForm.addControl('username', this.fb.control('', Validators.required));
      this.studentForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      // Trả về giá trị form cùng với ID nếu là edit mode và thêm role='STUDENT'
      const result = {
        ...(this.isEditMode ? { id: this.data.student?.id } : {}),
        ...this.studentForm.value,
        role: 'STUDENT'
      };
      
      // Nếu đang trong chế độ edit, giữ lại username từ dữ liệu gốc
      if (this.isEditMode && this.data.student?.username) {
        result.username = this.data.student.username;
      }
      
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
