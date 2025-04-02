import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state-icon">{{ icon }}</mat-icon>
      <p class="empty-state-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
      
      .empty-state-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #9e9e9e;
        margin-bottom: 16px;
      }
      
      .empty-state-message {
        margin: 0;
        color: #757575;
        font-size: 16px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'info';
  @Input() message = 'No data available';
} 