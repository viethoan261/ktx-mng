import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../components/notifications/notification-form-dialog/notification-form-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDetailComponent } from '../../notifications/notification-detail/notification-detail.component';
import { MatMenuTrigger } from '@angular/material/menu';

interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotificationPanel = false;
  userRole: string = '';
  private destroy$ = new Subject<void>();
  
  @ViewChild('notificationMenuTrigger') menuTrigger!: MatMenuTrigger;
  @ViewChild('notificationButton') notificationButton!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private renderer: Renderer2
  ) {
    // Lấy thông tin người dùng từ localStorage
    const userInfoStr = localStorage.getItem('user_info');
    if (userInfoStr) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoStr);
        this.userRole = userInfo.role;
      } catch (e) {
        this.userRole = '';
      }
    } else {
      this.userRole = '';
    }
  }

  ngOnInit(): void {
    this.loadNotifications();
    
    // Add global handler for menu positioning
    window.addEventListener('DOMContentLoaded', this.fixMenuPosition.bind(this));
    window.addEventListener('resize', this.fixMenuPosition.bind(this));
  }
  
  ngAfterViewInit(): void {
    if (this.menuTrigger) {
      // Fix menu position when it opens
      this.menuTrigger.menuOpened.subscribe(() => {
        this.fixMenuPosition();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove event listeners
    window.removeEventListener('DOMContentLoaded', this.fixMenuPosition.bind(this));
    window.removeEventListener('resize', this.fixMenuPosition.bind(this));
  }
  
  fixMenuPosition(): void {
    setTimeout(() => {
      const menuPanel = document.querySelector('.notification-menu-panel') as HTMLElement;
      if (!menuPanel) return;
      
      // Position at the right corner of the screen
      this.renderer.setStyle(menuPanel, 'position', 'fixed');
      this.renderer.setStyle(menuPanel, 'top', '64px');  // Right below the header
      this.renderer.setStyle(menuPanel, 'right', '20px'); // 20px from the right edge
      this.renderer.setStyle(menuPanel, 'left', 'auto');
      this.renderer.setStyle(menuPanel, 'width', '350px');
      this.renderer.setStyle(menuPanel, 'transform', 'none');
    }, 0);
  }

  loadNotifications(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {          
          // Lọc các thông báo có trạng thái active
          const activeNotifications = notifications.filter(notification => 
            notification.status === 'active'
          );
          
          // Tính toán số lượng thông báo chưa đọc từ tất cả thông báo active
          this.unreadCount = activeNotifications.filter(notification => 
            notification.isRead !== true
          ).length;
          
          // Lấy 5 thông báo mới nhất theo ID để hiển thị
          this.notifications = activeNotifications
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 5);
        },
        error: (error) => {
          console.error('Error loading notifications', error);
        }
      });
  }

  openNotificationDetail(notification: Notification): void {
    this.showNotificationPanel = false; // Close panel when opening detail
    
    // Mark this notification as read if not already read
    if (!notification.isRead) {
      this.markAsRead(notification);
    }
    
    this.dialog.open(NotificationDetailComponent, {
      width: '600px',
      data: { notification }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.id && !notification.isRead) {
      // Call API to mark notification as read
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update the notification locally
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
            
            // Update unread count
            this.unreadCount = this.notifications.filter(notification => !notification.isRead).length;
          },
          error: (error) => {
            console.error('Error marking notification as read', error);
          }
        });
    }
  }

  markAllAsRead(): void {
    // Call API to mark all notifications as read
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update all notifications locally
          this.notifications.forEach(notification => {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          });
          
          // Update unread count
          this.unreadCount = 0;
        },
        error: (error) => {
          console.error('Error marking all notifications as read', error);
        }
      });
  }

  viewAllNotifications(): void {
    this.showNotificationPanel = false; // Close panel when navigating away
    this.router.navigate(['/notifications']);
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }

  logout(): void { 
    // Proceed with normal logout
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Close the notification panel when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (notificationDropdown && !notificationDropdown.contains(target)) {
      this.showNotificationPanel = false;
    }
  }
  
  toggleNotificationPanel() {
    // Prevent the document click handler from immediately closing the panel
    event?.stopPropagation();
    this.showNotificationPanel = !this.showNotificationPanel;
  }
}
