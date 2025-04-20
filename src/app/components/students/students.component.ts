import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { StudentFormDialogComponent } from './student-form-dialog/student-form-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { AssignRoomDialogComponent } from './assign-room-dialog/assign-room-dialog.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  dataSource: MatTableDataSource<Student>;
  displayedColumns: string[] = ['fullname', 'email', 'phone', 'roomNumber', 'actions'];
  isLoading = false;
  private destroy$ = new Subject<void>();
  
  // Properties for confirm dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  studentToDelete: Student | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private studentService: StudentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Student>();
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.students = students;
          this.dataSource.data = this.students;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.isLoading = false;
          this.snackBar.open('Không thể tải danh sách sinh viên', 'Đóng', {
            duration: 3000
          });
        }
      });
  }

  onEdit(student: Student): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'custom-dialog';
    dialogConfig.data = { student };

    const dialogRef = this.dialog.open(StudentFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.studentService.updateStudent(student.id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadStudents();
              this.snackBar.open('Cập nhật sinh viên thành công', 'Đóng', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error updating student:', error);
              this.isLoading = false;
              this.snackBar.open('Không thể cập nhật sinh viên', 'Đóng', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  onDelete(student: Student): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa sinh viên',
        message: `Bạn có chắc chắn muốn xóa sinh viên "${student.fullname}" không? Hành động này không thể hoàn tác.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteStudent(student.id);
      }
    });
  }

  onAssignRoom(student: Student): void {
    // Tìm ID của phòng hiện tại nếu có
    let currentRoomId = null;
    
    if (student.roomNumber) {
      // Để đơn giản, chúng ta truyền roomNumber vào dialog dạng string
      // Component assign-room sẽ xử lý lọc theo tên phòng thay vì ID
      currentRoomId = student.roomNumber;
    }
    
    console.log('Student:', student.fullname, 'Current room:', currentRoomId);
    
    const dialogRef = this.dialog.open(AssignRoomDialogComponent, {
      width: '400px',
      data: {
        studentId: parseInt(student.id),
        currentRoomNumber: currentRoomId // Truyền roomNumber thay vì roomId
      }
    });

    dialogRef.afterClosed().subscribe(roomId => {
      if (roomId) {
        this.isLoading = true;
        this.studentService.assignRoom(parseInt(student.id), roomId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadStudents();
              this.snackBar.open('Gán phòng cho sinh viên thành công', 'Đóng', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error assigning room:', error);
              this.isLoading = false;
              this.snackBar.open('Không thể gán phòng cho sinh viên', 'Đóng', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  private deleteStudent(studentId: string): void {
    this.isLoading = true;
    this.studentService.deleteStudent(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadStudents();
          this.snackBar.open('Xóa sinh viên thành công', 'Đóng', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.isLoading = false;
          this.snackBar.open('Không thể xóa sinh viên', 'Đóng', {
            duration: 3000
          });
        }
      });
  }

  onCreate(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'custom-dialog';
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(StudentFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.studentService.createStudent(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadStudents();
              this.snackBar.open('Thêm sinh viên thành công', 'Đóng', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error creating student:', error);
              this.isLoading = false;
              this.snackBar.open('Không thể thêm sinh viên', 'Đóng', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  // Add this method for search functionality
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
