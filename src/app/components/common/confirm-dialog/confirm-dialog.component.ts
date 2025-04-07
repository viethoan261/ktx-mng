import { Component, Inject, EventEmitter, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  // Cho Standalone mode
  @Input() isOpen = false;
  @Input() title = 'Xác nhận';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();
  
  constructor(
    // Thêm optional để hỗ trợ cả 2 chế độ standalone và dialog
    @Inject(MAT_DIALOG_DATA) public data: any = null,
    public dialogRef: MatDialogRef<ConfirmDialogComponent> = null as any
  ) {
    // Nếu sử dụng MatDialog, lấy title và message từ data
    if (this.data) {
      this.title = this.data.title || this.title;
      this.message = this.data.message || this.message;
    }
  }

  onConfirm(): void {
    if (this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      this.confirmEvent.emit();
    }
  }

  onClose(): void {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    } else {
      this.closeEvent.emit();
      this.isOpen = false;
    }
  }
}
