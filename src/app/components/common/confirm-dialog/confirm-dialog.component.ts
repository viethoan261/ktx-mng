import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div *ngIf="isOpen" class="confirm-dialog-overlay">
      <div class="confirm-dialog">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="actions">
          <button mat-button (click)="onClose()">Hủy</button>
          <button mat-raised-button color="warn" (click)="onConfirm()">Xác nhận</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .confirm-dialog {
      background: white;
      padding: 24px;
      border-radius: 4px;
      min-width: 300px;
      max-width: 500px;
      
      h2 {
        margin: 0 0 16px;
        font-size: 20px;
      }
      
      p {
        margin: 0 0 24px;
        line-height: 1.5;
      }
      
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Xác nhận';
  @Input() message = 'Bạn có chắc chắn muốn thực hiện thao tác này?';
  @Output() confirmEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmEvent.emit();
    this.isOpen = false;
  }

  onClose(): void {
    this.closeEvent.emit();
    this.isOpen = false;
  }
}
