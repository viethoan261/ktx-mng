import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Security } from 'src/app/models/security';
import { CheckInRequest, SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-security-form-dialog',
  templateUrl: './security-form-dialog.component.html',
  styleUrls: ['./security-form-dialog.component.scss']
})
export class SecurityFormDialogComponent implements OnInit, OnDestroy {
  securityForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  dialogTitle = 'Đăng ký check-in';
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SecurityFormDialogComponent>,
    private securityService: SecurityService,
    @Inject(MAT_DIALOG_DATA) public data: Security | null
  ) {
    // Prevent dialog from closing when clicking outside
    this.dialogRef.disableClose = true;
    
    // Kiểm tra có phải mode chỉnh sửa không
    if (data && data.id) {
      this.isEditMode = true;
      this.dialogTitle = 'Chỉnh sửa thông tin check-in';
    }
  }

  ngOnInit(): void {
    this.createForm();
    
    // Nếu là mode chỉnh sửa, fill dữ liệu vào form
    if (this.isEditMode && this.data) {
      this.securityForm.patchValue({
        visitorName: this.data.visitorName,
        studentIdInput: this.data.studentId,
        phoneNumber: this.data.phoneNumber,
        purpose: this.data.purpose,
        notes: this.data.notes || ''
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): void {
    this.securityForm = this.fb.group({
      visitorName: ['', [Validators.required]],
      studentIdInput: [''], // Không bắt buộc
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      purpose: ['', [Validators.required]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.securityForm.invalid) {
      return;
    }

    const formValues = this.securityForm.value;

    const securityData: CheckInRequest = {
      visitorName: formValues.visitorName,
      phoneNumber: formValues.phoneNumber,
      studentId: formValues.studentIdInput || "0", // Nếu không nhập, gửi mã "0"
      purpose: formValues.purpose,
      notes: formValues.notes
    };

    this.isLoading = true;
    
    // Nếu là mode chỉnh sửa
    if (this.isEditMode && this.data && this.data.id) {
      this.securityService.updateSecurityRecord(this.data.id, securityData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error updating visitor', error);
            this.isLoading = false;
          }
        });
    } else {
      // Mode thêm mới
      this.securityService.checkIn(securityData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error checking in visitor', error);
            this.isLoading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
