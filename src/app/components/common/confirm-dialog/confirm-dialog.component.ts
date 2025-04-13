import { Component, Inject, EventEmitter, Input, Output, Optional, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit, AfterViewInit {
  @Input() title: string = 'Xác nhận';
  @Input() message: string = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() isOpen: boolean = false;
  @Input() confirmButtonText: string = 'Xác nhận';
  @Input() buttonColor: 'primary' | 'accent' | 'warn' = 'warn';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('confirmButton') confirmButton!: ElementRef;
  
  // For MatDialog usage
  dialogRef: MatDialogRef<ConfirmDialogComponent> | undefined;

  constructor(
    // Thêm @Optional() để đảm bảo component vẫn hoạt động khi không được inject qua dialog
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any = null,
    @Optional() public dialogRefInstance: MatDialogRef<ConfirmDialogComponent>
  ) {
    // Nếu sử dụng MatDialog, lấy title và message từ data
    if (this.data) {
      this.title = this.data.title || this.title;
      this.message = this.data.message || this.message;
      this.confirmButtonText = this.data.confirmButtonText || this.confirmButtonText;
      this.buttonColor = this.data.buttonColor || this.buttonColor;
    }
    
    if (dialogRefInstance) {
      this.dialogRef = dialogRefInstance;
    }
  }

  ngOnInit(): void {
    // Remove aria-hidden from app-root when dialog opens
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }
  }
  
  ngAfterViewInit(): void {
    // Focus the confirm button after dialog initializes
    setTimeout(() => {
      if (this.confirmButton && this.confirmButton.nativeElement) {
        this.confirmButton.nativeElement.focus();
      }
    }, 100);
  }

  onConfirm(): void {
    this.confirm.emit();
    if (this.dialogRef) {
      this.dialogRef.close(true);
    } else {
      this.isOpen = false;
    }
  }

  onClose(): void {
    this.close.emit();
    if (this.dialogRef) {
      this.dialogRef.close(false);
    } else {
      this.isOpen = false;
    }
  }
}
