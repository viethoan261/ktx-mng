import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account } from '../../../models/account.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-account-form-dialog',
  templateUrl: './account-form-dialog.component.html',
  styleUrls: ['./account-form-dialog.component.scss']
})
export class AccountFormDialogComponent implements OnInit {
  accountForm!: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { account?: Account },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data?.account;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.accountForm = this.fb.group({
      fullname: [this.data?.account?.fullname || '', Validators.required],
      email: [this.data?.account?.email || '', [Validators.required, Validators.email]],
      username: [{
        value: this.data?.account?.username || '',
        disabled: this.isEditMode
      }, Validators.required],
      phone: [this.data?.account?.phone || '', Validators.required],
      role: [this.data?.account?.role || 'STUDENT', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      // Lấy chỉ các trường cần thiết cho cập nhật
      const updateData = {
        fullname: this.accountForm.get('fullname')?.value,
        role: this.accountForm.get('role')?.value,
        email: this.accountForm.get('email')?.value,
        phone: this.accountForm.get('phone')?.value,
        password: this.accountForm.get('password')?.value,
        username: this.data?.account?.username
      };

      const updateUrl = `${environment.apiUrl}/Users/${this.data.account!.id}`;
      this.http.put(updateUrl, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Cập nhật tài khoản thành công!', 'Đóng', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Update failed:', err);
          this.snackBar.open(`Lỗi cập nhật: ${err.error?.message || err.message}`, 'Đóng', { duration: 5000 });
        }
      });
    } else {
      // Lấy toàn bộ form value cho tạo mới
      const formData = this.accountForm.value;
      
      const signupUrl = `${environment.apiUrl}/Users/signup`;
      this.http.post(signupUrl, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Tạo tài khoản mới thành công!', 'Đóng', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Signup failed:', err);
          const errorMessage = err.error?.message || err.error || err.message || 'Đã xảy ra lỗi không xác định.';
          this.snackBar.open(`Lỗi tạo tài khoản: ${errorMessage}`, 'Đóng', { duration: 5000 });
        }
      });
    }
  }

  onCancel(): void {
    if (!this.isLoading) {
       this.dialogRef.close();
    }
  }
} 