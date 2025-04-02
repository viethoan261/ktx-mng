import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-form-dialog',
  templateUrl: './student-form-dialog.component.html',
  styleUrls: ['./student-form-dialog.component.scss']
})
export class StudentFormDialogComponent {
  studentForm!: FormGroup;
  isEditMode: boolean;

  // Tạm thời danh sách phòng giả định, sau này có thể lấy từ service
  availableRooms: string[] = ['101', '102', '103', '201', '202'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student?: Student }
  ) {
    this.isEditMode = !!data?.student;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.studentForm = this.fb.group({
      // Các trường cơ bản giống Account, nhưng không có role, password
      fullName: [this.data?.student?.fullName || '', Validators.required],
      email: [this.data?.student?.email || '', [Validators.required, Validators.email]],
      // Trường thông tin riêng cho Student
      roomNumber: [this.data?.student?.roomNumber || null, Validators.required],
      // Thêm các trường khác nếu cần (ví dụ: mã số sinh viên, khoa)
      studentId: ['', Validators.required], // Ví dụ thêm mã số SV
    });

    // Nếu là chế độ tạo mới, mật khẩu là bắt buộc (giả sử cần mật khẩu ban đầu)
    if (!this.isEditMode) {
      this.studentForm.addControl('password', this.fb.control('', [Validators.required, Validators.minLength(6)]));
    }
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      // Trả về giá trị form cùng với ID nếu là edit mode
      const result = {
        ...(this.isEditMode ? { id: this.data.student?.id } : {}),
        ...this.studentForm.value
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
