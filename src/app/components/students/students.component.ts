import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Student } from '../../models/student.model'; // Import từ file model
// import { StudentService } from '../../services/student.service'; // Tạm thời comment, cần tạo service này
// import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component'; // Sẽ dùng khi có logic xóa
import { StudentFormDialogComponent } from './student-form-dialog/student-form-dialog.component'; // Bỏ comment import này

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  dataSource: MatTableDataSource<Student>;
  displayedColumns: string[] = ['fullName', 'email', 'roomNumber', 'actions'];
  isLoading = false; // Bắt đầu với false để hiển thị dữ liệu mock ngay

  // Mock data
  mockStudents: Student[] = [
    {
      id: 1,
      fullName: 'Nguyễn Văn A',
      email: 'vana@example.com',
      roomNumber: '101'
    },
    {
      id: 2,
      fullName: 'Trần Thị B',
      email: 'thib@example.com',
      roomNumber: '102'
    },
    {
      id: 3,
      fullName: 'Lê Văn C',
      email: 'vanc@example.com',
      roomNumber: '201'
    }
  ];

  // Biến cho confirm dialog (tương tự accounts)
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  studentToDelete: Student | null = null;

  constructor(
    // private studentService: StudentService, // Uncomment khi có service
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Student>();
  }

  ngOnInit(): void {
    // For mock data
    this.isLoading = false;
    this.students = this.mockStudents;
    this.dataSource.data = this.mockStudents;
  }

  // Placeholder methods, cần triển khai logic thực tế
  loadStudents(): void {
    this.isLoading = true;
    // Gọi service để lấy data
    console.log('Loading students...');
    // Tạm thời hoàn thành giả
    setTimeout(() => {
      this.students = this.mockStudents;
      this.dataSource.data = this.students;
      this.isLoading = false;
    }, 1000);
  }

  onEdit(student: Student): void {
    console.log('Edit student:', student);
    // Mở dialog chỉnh sửa
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px'; // Giống accounts
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'custom-dialog'; // Áp dụng class global nếu cần
    dialogConfig.data = { student }; // Truyền student vào dialog

    const dialogRef = this.dialog.open(StudentFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updating student:', result);
        // TODO: Implement the actual update logic (call service)
        // Tạm cập nhật mock data
        const index = this.students.findIndex(s => s.id === result.id);
        if (index > -1) {
          this.students[index] = { ...this.students[index], ...result };
          this.dataSource.data = [...this.students]; // Trigger table update
        }
      }
    });
  }

  onDelete(student: Student): void {
    console.log('Delete student:', student);
    // Hiển thị confirm dialog
    this.studentToDelete = student;
    this.confirmDialogTitle = 'Xác nhận xóa';
    this.confirmDialogMessage = `Bạn có chắc chắn muốn xóa sinh viên ${student.fullName}?`;
    this.showConfirmDialog = true;
  }

  confirmDeleteStudent(): void {
    if (this.studentToDelete) {
      console.log('Confirmed delete:', this.studentToDelete);
      // Gọi service xóa hoặc cập nhật mock data
      this.students = this.students.filter(s => s.id !== this.studentToDelete!.id);
      this.dataSource.data = this.students;
      this.showConfirmDialog = false;
      this.studentToDelete = null;
    }
  }

  onCreate(): void {
    console.log('Create new student');
    // Mở dialog tạo mới
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px'; // Giống accounts
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'custom-dialog'; // Áp dụng class global nếu cần
    dialogConfig.data = {}; // Không truyền student vì là tạo mới

    const dialogRef = this.dialog.open(StudentFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating new student:', result);
        // TODO: Implement the actual creation logic (call service)
        // Tạm thêm vào mock data
        const newId = this.students.length > 0 ? Math.max(...this.students.map(s => s.id)) + 1 : 1;
        const newStudent: Student = { id: newId, ...result };
        this.students.push(newStudent);
        this.dataSource.data = [...this.students]; // Trigger table update
      }
    });
  }
}
