import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-form-dialog',
  templateUrl: './account-form-dialog.component.html',
  styleUrls: ['./account-form-dialog.component.scss']
})
export class AccountFormDialogComponent {
  accountForm!: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { account?: Account }
  ) {
    this.isEditMode = !!data?.account;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.accountForm = this.fb.group({
      fullName: [this.data?.account?.fullName || '', Validators.required],
      email: [this.data?.account?.email || '', [Validators.required, Validators.email]],
      role: [this.data?.account?.role || 'student', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.dialogRef.close(this.accountForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 