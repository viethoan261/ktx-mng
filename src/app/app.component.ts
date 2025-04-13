import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    // Kiểm tra trạng thái đăng nhập khi khởi động ứng dụng
    // if (!this.authService.isLoggedIn() && this.router.url !== '/login') {
    //   this.router.navigate(['/login']);
    // }
  }
  
  ngAfterViewInit() {
    // Remove any aria-hidden attributes that might be automatically added
    const appRoot = this.elementRef.nativeElement;
    this.renderer.removeAttribute(appRoot, 'aria-hidden');
    
    // Create a MutationObserver to detect if aria-hidden is added dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
          this.renderer.removeAttribute(appRoot, 'aria-hidden');
        }
      });
    });
    
    // Start observing the app-root element for attribute changes
    observer.observe(appRoot, { attributes: true });
  }
}
