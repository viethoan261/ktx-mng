import { Component, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Room, RoomCreateDto } from '../../../models/room.model';
import { UserService } from '../../../services/user.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-room-form-dialog',
  templateUrl: './room-form-dialog.component.html',
  styleUrls: ['./room-form-dialog.component.scss']
})
export class RoomFormDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  roomForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  students: Student[] = []; // Unassigned students (for create mode)
  selectedStudents: Student[] = []; // Currently selected students
  allAvailableStudents: Student[] = []; // All students (for reference)
  displayStudents: Student[] = []; // Combined list for edit mode (unassigned + current room students)
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoomFormDialogComponent>,
    private userService: UserService,
    private studentService: StudentService,
    @Inject(MAT_DIALOG_DATA) public data: { room?: Room }
  ) {
    this.isEditMode = !!data?.room;
    
    // Nếu đang chỉnh sửa và có students trong phòng
    if (this.isEditMode && this.data.room?.students && this.data.room.students.length > 0) {
      // Khởi tạo mảng selectedStudents ngay từ đầu
      this.selectedStudents = [...this.data.room.students];
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();
  }

  ngAfterViewInit(): void {
    // Thêm check để đảm bảo cập nhật selectedStudents sau khi component đã được khởi tạo
    setTimeout(() => {
      if (this.isEditMode && this.selectedStudents.length === 0 && this.data.room?.students && this.data.room.students.length > 0) {
        // Cập nhật selectedStudents từ students của phòng
        this.selectedStudents = [...this.data.room.students];
        
        // Cập nhật giá trị studentIds trong form
        const studentIds = this.data.room.students.map(student => student.id);
        this.roomForm.get('studentIds')?.setValue(studentIds);
      }
    }, 300);
  }

  private loadStudents(): void {
    this.isLoading = true;
    
    // Tải tất cả sinh viên
    this.studentService.getStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (allStudents) => {
          // Lưu tất cả sinh viên
          this.allAvailableStudents = [...allStudents];
          
          // Lọc sinh viên chưa có phòng
          const unassignedStudents = allStudents.filter(student => !student.roomNumber);
          
          if (this.isEditMode && this.data.room?.students && this.data.room.students.length > 0) {
            
            // Sử dụng students từ dữ liệu phòng
            const roomStudents = this.data.room.students;
            
            // Danh sách hiển thị bao gồm:
            // 1. Sinh viên chưa có phòng
            // 2. Sinh viên của phòng này
            this.displayStudents = [...unassignedStudents];
            
            // Thêm sinh viên của phòng này nếu chưa có trong danh sách
            roomStudents.forEach(student => {
              if (!this.displayStudents.some(s => s.id === student.id)) {
                this.displayStudents.push(student);
              }
            });
            
            // Thiết lập danh sách sinh viên đã chọn
            this.selectedStudents = [...roomStudents];
            
            // Cập nhật giá trị form với ID của sinh viên
            setTimeout(() => {
              const studentIds = roomStudents.map(student => student.id);
              this.roomForm.get('studentIds')?.setValue(studentIds);
            }, 0);
          } else {
            // Chế độ tạo mới hoặc phòng không có sinh viên
            this.displayStudents = [...unassignedStudents];
            this.selectedStudents = [];
          }
          
          // Lưu danh sách sinh viên chưa gán phòng
          this.students = [...unassignedStudents];
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.isLoading = false;
        }
      });
  }

  private initForm(): void {
    let initialStudentIds: string[] = [];
    
    // Lấy ID của sinh viên từ students nếu có
    if (this.isEditMode && this.data.room?.students && this.data.room.students.length > 0) {
      initialStudentIds = this.data.room.students.map(student => student.id);
    }
    
    this.roomForm = this.fb.group({
      roomNumber: [this.data?.room?.roomNumber || '', [Validators.required]],
      floorNumber: [this.data?.room?.floorNumber || '', [Validators.required]],
      maxOccupancy: [this.data?.room?.maxOccupancy || '', [Validators.required, Validators.min(1)]],
      status: [this.data?.room?.status || 'EMPTY', [Validators.required]],
      currentOccupancy: [{
        value: this.data?.room?.currentOccupancy || 0,
        disabled: true
      }, [Validators.min(0)]],
      studentIds: [initialStudentIds]
    });

    // Listen for changes in the studentIds array
    this.roomForm.get('studentIds')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedIds => {
        if (selectedIds) {
          this.updateSelectedStudents(selectedIds);
          
          if (selectedIds.length > 0) {
            this.roomForm.patchValue({
              status: 'OCCUPIED',
              currentOccupancy: selectedIds.length
            }, { emitEvent: false });
          }
        }
      });

    // Listen for changes in the status field
    this.roomForm.get('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        if (status !== 'OCCUPIED') {
          this.roomForm.patchValue({
            studentIds: [],
            currentOccupancy: 0
          }, { emitEvent: false });
          this.selectedStudents = [];
        }
      });
  }

  private updateSelectedStudents(studentIds: string[]): void {
    
    if (!studentIds || studentIds.length === 0) {
      this.selectedStudents = [];
      return;
    }
    
    // Use allAvailableStudents to ensure we can find students from all rooms
    this.selectedStudents = this.allAvailableStudents.filter(student => 
      studentIds.includes(student.id)
    );
  }

  removeStudent(studentId: string): void {
    // Get current student IDs from form
    const currentIds = [...(this.roomForm.get('studentIds')?.value || [])];    
    // Filter out the student to remove
    const updatedIds = currentIds.filter(id => id !== studentId);    
    
    // Update the form value
    this.roomForm.get('studentIds')?.setValue(updatedIds);
    
    // Directly update the selectedStudents array
    this.selectedStudents = this.selectedStudents.filter(student => student.id !== studentId);
    
    // Update room status if no students are selected
    if (updatedIds.length === 0) {
      this.roomForm.patchValue({
        status: 'EMPTY',
        currentOccupancy: 0
      }, { emitEvent: false });
    } else {
      this.roomForm.patchValue({
        currentOccupancy: updatedIds.length
      }, { emitEvent: false });
    }
  }

  compareStudents(id1: any, id2: any): boolean {
    return id1 === id2;
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      // Include only needed properties
      const result: RoomCreateDto = {
        roomNumber: this.roomForm.get('roomNumber')?.value,
        floorNumber: this.roomForm.get('floorNumber')?.value,
        maxOccupancy: this.roomForm.get('maxOccupancy')?.value,
        status: this.roomForm.get('status')?.value,
        currentOccupancy: this.selectedStudents.length,
        studentIds: this.roomForm.get('studentIds')?.value || []
      };
      
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 