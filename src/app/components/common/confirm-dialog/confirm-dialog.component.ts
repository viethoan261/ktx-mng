import { Component, Input, Output, EventEmitter, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  // Standalone mode props
  @Input() isOpen = false;
  @Input() title = 'Xác nhận xóa';
  @Input() message = 'Bạn có chắc chắn muốn xóa mục này?';
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();

  // For usage with MatDialog
  constructor(
    @Optional() public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {
    // If used with MatDialog, get values from data
    if (this.data) {
      this.title = this.data.title;
      this.message = this.data.message;
      this.isOpen = true;
    }
  }

  onConfirm() {
    if (this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      this.confirmEvent.emit();
    }
  }

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    } else {
      this.closeEvent.emit();
    }
  }
}
