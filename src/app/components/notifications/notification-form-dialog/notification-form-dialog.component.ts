import { Component, Inject, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MatDatepicker } from '@angular/material/datepicker';

export interface Notification {
  id?: number;
  title: string;
  content: string;
  type: string;
  status: string;
  publishDate: Date;
  expiryDate: Date;
  createdBy?: number;
  createdByName?: string;
  createdDate?: string;
  modifiedDate?: string;
  isRead?: boolean;
  readAt?: string;
}

@Component({
  selector: 'app-notification-form-dialog',
  templateUrl: './notification-form-dialog.component.html',
  styleUrls: ['./notification-form-dialog.component.css']
})
export class NotificationFormDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  notificationForm!: FormGroup;
  isEditMode: boolean;
  isLoading = false;

  @ViewChild('publishPicker') publishPicker!: MatDatepicker<Date>;
  @ViewChild('expiryPicker') expiryPicker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NotificationFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notification?: Notification },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data?.notification;
    
    // Prevent dialog from closing when clicking outside
    this.dialogRef.disableClose = true;
    
    // Configure dialog to handle click events properly
    this.dialogRef.backdropClick().subscribe(() => {
      // Do nothing to prevent the dialog from closing
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    
    // Fix for scrollbar issues
    document.body.style.overflow = 'hidden';
  }

  ngAfterViewInit(): void {
    // Fix for date picker dialog z-index
    this.fixDatepickerInteractions();
  }
  
  ngOnDestroy(): void {
    // Restore body styles when component is destroyed
    document.body.style.overflow = 'auto';
  }

  private fixDatepickerInteractions(): void {
    // Ensure the datepicker panels stay on top but don't block dialog interactions
    const dialogContainer = document.querySelector('.mat-dialog-container') as HTMLElement;
    const dialogActions = document.querySelector('.mat-dialog-actions') as HTMLElement;
    
    if (dialogContainer) {
      dialogContainer.style.zIndex = '1002';
    }
    
    if (dialogActions) {
      dialogActions.style.zIndex = '1100';
      dialogActions.style.position = 'relative';
      
      // Make all buttons in dialog actions clickable
      const buttons = dialogActions.querySelectorAll('button');
      buttons.forEach(button => {
        button.style.zIndex = '1200';
        button.style.position = 'relative';
        button.style.pointerEvents = 'auto';
      });
    }
  }

  private initializeForm(): void {
    const today = new Date();
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(today.getMonth() + 1); // Set default expiry date to 1 month from now
    
    this.notificationForm = this.fb.group({
      title: [this.data?.notification?.title || '', Validators.required],
      content: [this.data?.notification?.content || '', Validators.required],
      type: [this.data?.notification?.type || 'internal', Validators.required],
      status: [this.data?.notification?.status || 'active', Validators.required],
      publishDate: [this.data?.notification?.publishDate || today, Validators.required],
      expiryDate: [this.data?.notification?.expiryDate || defaultExpiry, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.notificationForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formData = this.notificationForm.value;
    
    // Format dates as ISO strings
    formData.publishDate = new Date(formData.publishDate).toISOString();
    formData.expiryDate = new Date(formData.expiryDate).toISOString();

    const apiUrl = `${environment.apiUrl}/Notifications`;
    
    if (this.isEditMode) {
      const notificationId = this.data.notification?.id;
      this.http.put(`${apiUrl}/${notificationId}`, formData)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating notification', error);
            this.snackBar.open('Lỗi cập nhật thông báo!', 'Đóng', { duration: 3000 });
          }
        });
    } else {
      this.http.post(apiUrl, formData)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating notification', error);
            this.snackBar.open('Lỗi tạo thông báo!', 'Đóng', { duration: 3000 });
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
