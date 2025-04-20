import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Notification } from './notification-form-dialog/notification-form-dialog.component';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { NotificationFormDialogComponent } from './notification-form-dialog/notification-form-dialog.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';

interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<Notification>;
  displayedColumns: string[] = ['title', 'type', 'status', 'publishDate', 'expiryDate', 'actions'];
  isLoading = true;
  userRole: string = '';
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Notification>([]);
    
    // Lấy thông tin người dùng từ localStorage
    const userInfoStr = localStorage.getItem('user_info');
    if (userInfoStr) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoStr);
        this.userRole = userInfo.role;
      } catch (e) {
        console.error('Error parsing user info:', e);
        this.userRole = '';
      }
    } else {
      this.userRole = '';
    }
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Set default sort to ID descending
    this.sort.sort({
      id: 'id',
      start: 'desc',
      disableClear: false
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          // Sort by ID in descending order
          this.dataSource.data = notifications.sort((a, b) => (b.id || 0) - (a.id || 0));
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading notifications', error);
          this.snackBar.open('Lỗi tải danh sách thông báo!', 'Đóng', { duration: 3000 });
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onCreate(): void {
    this.openNotificationDialog();
  }

  onEdit(notification: Notification): void {
    this.openNotificationDialog(notification);
  }

  onViewDetail(notification: Notification): void {
    // Mark as read when viewing detail
    if (notification.id && !notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update notification in the local data
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          },
          error: (error) => {
            console.error('Error marking notification as read', error);
          }
        });
    }
    
    // Open detail dialog
    this.dialog.open(NotificationDetailComponent, {
      width: '600px',
      data: { notification }
    });
  }

  onDelete(notification: Notification): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa thông báo "${notification.title}"?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.isLoading = true;
          this.notificationService.deleteNotification(notification.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Thông báo đã được xóa!', 'Đóng', { duration: 3000 });
                this.loadNotifications();
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error deleting notification', error);
                this.snackBar.open('Lỗi xóa thông báo!', 'Đóng', { duration: 3000 });
              }
            });
        }
      });
  }

  private openNotificationDialog(notification?: Notification): void {
    const isEditMode = !!notification;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'notification-form-dialog';
    dialogConfig.data = { notification };

    const dialogRef = this.dialog.open(NotificationFormDialogComponent, dialogConfig);

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Thông báo đã được ${isEditMode ? 'cập nhật' : 'tạo mới'}!`, 'Đóng', { duration: 3000 });
          this.loadNotifications();
        }
      });
  }
}
