import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaintenanceTask, MaintenanceStatusLabels, MaintenancePriorityLabels, MaintenanceTypeLabels } from '../../../models/maintenance.model';

@Component({
  selector: 'app-maintenance-detail-dialog',
  templateUrl: './maintenance-detail-dialog.component.html',
  styleUrls: ['./maintenance-detail-dialog.component.scss']
})
export class MaintenanceDetailDialogComponent implements OnInit {
  task!: MaintenanceTask;
  statusLabels = MaintenanceStatusLabels;
  priorityLabels = MaintenancePriorityLabels;
  typeLabels = MaintenanceTypeLabels;

  constructor(
    public dialogRef: MatDialogRef<MaintenanceDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaintenanceTask
  ) { }

  ngOnInit(): void {
    this.task = this.data;
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'Chưa xác định';
    return new Date(date).toLocaleString('vi-VN');
  }

  // Safe accessor methods for template use
  getTypeLabel(type: string): string {
    return this.typeLabels[type as keyof typeof this.typeLabels] || '';
  }
  
  getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || '';
  }
  
  getPriorityLabel(priority: string): string {
    return this.priorityLabels[priority as keyof typeof this.priorityLabels] || '';
  }

  getStatusClass(status: string): string {
    return `status-badge status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-badge priority-${priority.toLowerCase()}`;
  }

  getTypeClass(type: string): string {
    return `type-badge type-${type.toLowerCase()}`;
  }
}