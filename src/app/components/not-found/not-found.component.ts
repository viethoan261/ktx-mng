import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  // Nếu bạn muốn thêm function để quay lại trang trước
  goBack(): void {
    window.history.back();
  }
} 