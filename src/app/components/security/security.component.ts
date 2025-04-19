import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { SecurityFormDialogComponent } from './security-form-dialog/security-form-dialog.component';
import { SecurityDetailDialogComponent } from './security-detail-dialog/security-detail-dialog.component';

interface UserInfo {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<Security>;
  displayedColumns: string[] = ['visitorName', 'phoneNumber', 'studentId', 'purpose', 'entryTime', 'exitTime', 'status', 'actions'];
  isLoading = true;
  userRole: string = '';
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private securityService: SecurityService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Security>([]);
    
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

  formatDate(date: string | null | undefined): string {
    if (!date) return 'Không có';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      // Định dạng DD/MM/YYYY HH:MM
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  }

  ngOnInit(): void {
    this.loadSecurityRecords();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
      
      // Set default sort to entryTime descending
      this.sort.sort({
        id: 'entryTime',
        start: 'desc',
        disableClear: false
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSecurityRecords(): void {
    this.isLoading = true;
    this.securityService.getSecurityRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (records) => {
          // Sort by ID in descending order
          this.dataSource.data = records.sort((a, b) => (b.id || 0) - (a.id || 0));
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading security records', error);
          this.snackBar.open('Lỗi tải danh sách!', 'Đóng', { duration: 3000 });
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

  openSecurityDialog(record?: Security): void {
    const dialogRef = this.dialog.open(SecurityFormDialogComponent, {
      width: '500px',
      disableClose: true,
      data: record
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.snackBar.open(record ? 'Cập nhật bản ghi thành công!' : 'Đăng ký check-in thành công!', 'Đóng', { duration: 3000 });
          this.loadSecurityRecords();
        }
      });
  }

  viewDetails(record: Security): void {
    this.dialog.open(SecurityDetailDialogComponent, {
      width: '500px',
      data: record
    });
  }

  editRecord(record: Security): void {
    this.openSecurityDialog(record);
  }

  deleteRecord(record: Security): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa bản ghi của "${record.visitorName}"?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && record.id) {
          this.isLoading = true;
          this.securityService.deleteSecurityRecord(record.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Bản ghi đã được xóa!', 'Đóng', { duration: 3000 });
                this.loadSecurityRecords();
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error deleting security record', error);
                this.snackBar.open('Lỗi xóa bản ghi!', 'Đóng', { duration: 3000 });
              }
            });
        }
      });
  }

  checkOut(record: Security): void {
    if (!record.id) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận đăng ký ra',
        message: `Bạn có chắc chắn muốn đăng ký ra cho "${record.visitorName}"?`,
        confirmText: 'Xác nhận',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.isLoading = true;
          this.securityService.checkOut(record.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Đã đăng ký ra thành công!', 'Đóng', { duration: 3000 });
                this.loadSecurityRecords();
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error checking out', error);
                this.snackBar.open('Lỗi đăng ký ra!', 'Đóng', { duration: 3000 });
              }
            });
        }
      });
  }
}
