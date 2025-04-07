import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Trang không tồn tại</h2>
      <p>Không thể tìm thấy trang bạn yêu cầu.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">Quay về Dashboard</button>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80vh;
      text-align: center;
    }
    h1 { font-size: 6rem; color: #f44336; margin-bottom: 0; }
  `]
})
export class NotFoundComponent {
  // Nếu bạn muốn thêm function để quay lại trang trước
  goBack(): void {
    window.history.back();
  }
} 