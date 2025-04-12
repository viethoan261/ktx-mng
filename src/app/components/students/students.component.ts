import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { StudentFormDialogComponent } from './student-form-dialog/student-form-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';

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
}
