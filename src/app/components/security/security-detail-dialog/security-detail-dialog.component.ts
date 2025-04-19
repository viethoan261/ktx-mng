import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Security } from '../../../models/security';

@Component({
  selector: 'app-security-detail-dialog',
  templateUrl: './security-detail-dialog.component.html',
  styleUrls: ['./security-detail-dialog.component.scss']
})
export class SecurityDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SecurityDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Security
  ) {}

  formatDate(date: string | null | undefined): string {
    if (!date) return 'Không có';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      // Định dạng DD/MM/YYYY HH:MM
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
} 