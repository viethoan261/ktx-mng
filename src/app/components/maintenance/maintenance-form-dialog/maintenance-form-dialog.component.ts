import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaintenanceTask, MaintenanceStatusLabels, MaintenancePriorityLabels, MaintenanceTypeLabels } from '../../../models/maintenance.model';
import { MaintenanceService } from '../../../services/maintenance.service';

@Component({
  selector: 'app-maintenance-form-dialog',
  templateUrl: './maintenance-form-dialog.component.html',
  styleUrls: ['./maintenance-form-dialog.component.scss']
})
export class MaintenanceFormDialogComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  
  statusLabels = MaintenanceStatusLabels;
  priorityLabels = MaintenancePriorityLabels;
  typeLabels = MaintenanceTypeLabels;

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    public dialogRef: MatDialogRef<MaintenanceFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaintenanceTask
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.createForm();
  }

  createForm(): void {
    this.form = this.fb.group({
      id: [this.data?.id || null],
      title: [this.data?.title || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.data?.description || ''],
      taskType: [this.data?.taskType || 'MAINTENANCE', Validators.required],
      location: [this.data?.location || '', Validators.required],
      scheduledDate: [this.data?.scheduledDate ? new Date(this.data.scheduledDate) : new Date(), Validators.required],
      status: [this.data?.status || 'SCHEDULED', Validators.required],
      priority: [this.data?.priority || 'MEDIUM', Validators.required],
      assignedTo: [this.data?.assignedTo || ''],
      notes: [this.data?.notes || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const formData = this.form.value;
    
    // Format scheduledDate to ISO string
    if (formData.scheduledDate instanceof Date) {
      formData.scheduledDate = formData.scheduledDate.toISOString();
    }

    if (this.isEditMode && formData.id) {
      this.maintenanceService.updateMaintenanceTask(formData.id, formData)
        .subscribe({
          next: (result) => {
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error updating maintenance task', error);
            this.isSubmitting = false;
          }
        });
    } else {
      this.maintenanceService.createMaintenanceTask(formData)
        .subscribe({
          next: (result) => {
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error creating maintenance task', error);
            this.isSubmitting = false;
          }
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getFormControlError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Trường này không được để trống';
    }
    
    if (control.errors['maxlength']) {
      return `Không được vượt quá ${control.errors['maxlength'].requiredLength} ký tự`;
    }

    return 'Giá trị không hợp lệ';
  }
}