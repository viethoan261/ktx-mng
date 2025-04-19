import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MaintenanceTask, MaintenanceStatusLabels, MaintenancePriorityLabels, MaintenanceTypeLabels } from '../../models/maintenance.model';
import { MaintenanceService } from '../../services/maintenance.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { MaintenanceFormDialogComponent } from './maintenance-form-dialog/maintenance-form-dialog.component';
import { MaintenanceDetailDialogComponent } from './maintenance-detail-dialog/maintenance-detail-dialog.component';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<MaintenanceTask>;
  displayedColumns: string[] = ['title', 'taskType', 'location', 'scheduledDate', 'status', 'priority', 'actions'];
  isLoading = true;
  statusLabels = MaintenanceStatusLabels;
  priorityLabels = MaintenancePriorityLabels;
  typeLabels = MaintenanceTypeLabels;
  
  filterStatus: string = '';
  filterType: string = '';
  filterPriority: string = '';
  
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private maintenanceService: MaintenanceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<MaintenanceTask>([]);
  }

  ngOnInit(): void {
    this.loadMaintenanceTasks();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
      
      // Set default sort to scheduledDate descending
      this.sort.sort({
        id: 'scheduledDate',
        start: 'desc',
        disableClear: false
      });
    }

    // Type-safe accessor functions
    const getTypeLabel = (type: string): string => {
      return this.typeLabels[type as keyof typeof this.typeLabels] || '';
    };
    
    const getStatusLabel = (status: string): string => {
      return this.statusLabels[status as keyof typeof this.statusLabels] || '';
    };
    
    const getPriorityLabel = (priority: string): string => {
      return this.priorityLabels[priority as keyof typeof this.priorityLabels] || '';
    };

    // Custom filter predicate cho bảng
    this.dataSource.filterPredicate = (data: MaintenanceTask, filter: string) => {
      const searchStr = (
        data.title +
        data.location +
        (data.description || '') +
        getTypeLabel(data.taskType) +
        getStatusLabel(data.status) +
        getPriorityLabel(data.priority)
      ).toLowerCase();

      return searchStr.indexOf(filter.toLowerCase()) !== -1;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Safe accessor methods for template use
  getTypeLabel(type: string): string {
    return this.typeLabels[type as keyof typeof this.typeLabels] || '';
  }
  
  getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || '';
  }
  
  getPriorityLabel(priority: string): string {
    return this.priorityLabels[priority as keyof typeof this.priorityLabels] || '';
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

  loadMaintenanceTasks(): void {
    this.isLoading = true;
    this.maintenanceService.searchTasks({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          // Sắp xếp theo ngày giảm dần (mới nhất lên đầu)
          this.dataSource.data = tasks.sort((a, b) => 
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          );
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading maintenance tasks', error);
          this.snackBar.open('Lỗi tải danh sách công việc!', 'Đóng', { duration: 3000 });
        }
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters(): void {
    this.isLoading = true;
    
    // Prepare filter object for the search API
    const filters: {type?: string, status?: string, priority?: string} = {};
    
    if (this.filterType) {
      filters.type = this.filterType;
    }
    
    if (this.filterStatus) {
      filters.status = this.filterStatus;
    }
    
    if (this.filterPriority) {
      filters.priority = this.filterPriority;
    }
    
    // Call the combined search API
    this.maintenanceService.searchTasks(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.dataSource.data = tasks.sort((a, b) => 
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          );
          this.isLoading = false;
          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Lỗi khi tìm kiếm công việc:', error);
          this.snackBar.open('Không thể tìm kiếm công việc. Vui lòng thử lại.', 'Đóng', {
            duration: 3000,
          });
        }
      });
  }

  resetFilters(): void {
    this.filterStatus = '';
    this.filterType = '';
    this.filterPriority = '';
    this.applyFilters();
  }

  openMaintenanceDialog(task?: MaintenanceTask): void {
    const dialogRef = this.dialog.open(MaintenanceFormDialogComponent, {
      width: '600px',
      disableClose: true,
      data: task
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.snackBar.open(task ? 'Cập nhật công việc thành công!' : 'Thêm công việc mới thành công!', 'Đóng', { duration: 3000 });
          this.loadMaintenanceTasks();
        }
      });
  }

  viewDetails(task: MaintenanceTask): void {
    this.dialog.open(MaintenanceDetailDialogComponent, {
      width: '600px',
      data: task
    });
  }

  editTask(task: MaintenanceTask): void {
    this.openMaintenanceDialog(task);
  }

  deleteTask(task: MaintenanceTask): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa công việc "${task.title}"?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && task.id) {
          this.isLoading = true;
          this.maintenanceService.deleteMaintenanceTask(task.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Công việc đã được xóa!', 'Đóng', { duration: 3000 });
                this.loadMaintenanceTasks();
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error deleting maintenance task', error);
                this.snackBar.open('Lỗi xóa công việc!', 'Đóng', { duration: 3000 });
              }
            });
        }
      });
  }

  updateStatus(task: MaintenanceTask, newStatus: string): void {
    if (task.id) {
      this.isLoading = true;
      this.maintenanceService.updateTaskStatus(task.id, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Cập nhật trạng thái thành công!', 'Đóng', { duration: 3000 });
            this.loadMaintenanceTasks();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating task status', error);
            this.snackBar.open('Lỗi cập nhật trạng thái!', 'Đóng', { duration: 3000 });
          }
        });
    }
  }

  markCompleted(task: MaintenanceTask): void {
    if (!task.id) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận hoàn thành',
        message: `Bạn có chắc chắn muốn đánh dấu công việc "${task.title}" là đã hoàn thành?`,
        confirmText: 'Xác nhận',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.isLoading = true;
          this.maintenanceService.markTaskCompleted(task.id!)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Đã đánh dấu hoàn thành!', 'Đóng', { duration: 3000 });
                this.loadMaintenanceTasks();
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error marking task as completed', error);
                this.snackBar.open('Lỗi cập nhật trạng thái!', 'Đóng', { duration: 3000 });
              }
            });
        }
      });
  }
} 