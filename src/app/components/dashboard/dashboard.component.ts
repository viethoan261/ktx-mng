import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../components/notifications/notification-form-dialog/notification-form-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  recentNotifications: Notification[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRecentNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          // Filter for active notifications and sort by publish date (newest first)
          const activeNotifications = notifications
            .filter(notification => notification.status === 'active')
            .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
            .slice(0, 5); // Get only the 5 most recent
          
          this.recentNotifications = activeNotifications;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading notifications', error);
          this.snackBar.open('Không thể tải thông báo. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
          this.recentNotifications = [];
        }
      });
  }

  // Method to refresh notifications
  refreshNotifications(): void {
    this.loadRecentNotifications();
  }
}
