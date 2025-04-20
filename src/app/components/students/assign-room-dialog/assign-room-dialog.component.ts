import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RoomService } from '../../../services/room.service';
import { Room } from '../../../models/room.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-assign-room-dialog',
  templateUrl: './assign-room-dialog.component.html',
  styleUrls: ['./assign-room-dialog.component.scss']
})
export class AssignRoomDialogComponent implements OnInit {
  rooms: Room[] = [];
  roomControl = new FormControl('', [Validators.required]);
  isLoading = true;
  errorMessage = '';

  constructor(
    private roomService: RoomService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AssignRoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      studentId: number, 
      currentRoomNumber?: string 
    }
  ) { }

  ngOnInit(): void {
    this.loadAvailableRooms();
  }

  loadAvailableRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Debug current data
    console.log('Student data:', this.data);
    
    this.roomService.getRooms() // Dùng getRooms() thay vì getAvailableRooms() để lấy tất cả phòng
      .pipe(
        catchError(error => {
          this.errorMessage = 'Không thể tải danh sách phòng. Vui lòng thử lại sau.';
          console.error('Error loading rooms:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((rooms: Room[]) => {
        // Log tất cả phòng nhận được từ API
        console.log('All rooms from API:', rooms);
        
        // Lọc những phòng phù hợp
        this.rooms = rooms.filter(room => {
          // Kiểm tra xem phòng này có phải là phòng hiện tại của sinh viên không
          const isCurrentRoom = this.data.currentRoomNumber && 
                               room.roomNumber === this.data.currentRoomNumber;
          
          // Kiểm tra phòng còn chỗ
          const currentOccupancy = room.currentOccupancy !== undefined ? room.currentOccupancy : 0;
          const hasCapacity = room.maxOccupancy !== undefined && currentOccupancy < room.maxOccupancy;
          
          // Log thông tin chi tiết về mỗi phòng và lý do lọc
          console.log(`Room ${room.roomNumber} (ID: ${room.id}):`, {
            isCurrentRoom,
            currentRoomNumber: this.data.currentRoomNumber,
            currentOccupancy,
            maxOccupancy: room.maxOccupancy,
            hasCapacity,
            pass: !isCurrentRoom && hasCapacity
          });
          
          // Loại bỏ phòng hiện tại và chỉ lấy phòng còn chỗ trống
          return !isCurrentRoom && hasCapacity;
        });
        
        console.log('Filtered rooms:', this.rooms);
        
        if (this.rooms.length === 0) {
          this.errorMessage = 'Không có phòng phù hợp để gán cho sinh viên này.';
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAssign(): void {
    if (this.roomControl.invalid) {
      this.snackBar.open('Vui lòng chọn phòng', 'Đóng', { duration: 3000 });
      return;
    }
    
    const selectedRoomId = this.roomControl.value;
    
    // Kiểm tra null hoặc rỗng
    if (selectedRoomId === null || selectedRoomId === '') {
      this.snackBar.open('Vui lòng chọn phòng', 'Đóng', { duration: 3000 });
      return;
    }
    
    const selectedRoom = this.rooms.find(room => room.id === selectedRoomId);
    
    if (!selectedRoom) {
      this.snackBar.open('Phòng không hợp lệ', 'Đóng', { duration: 3000 });
      return;
    }
    
    // Convert to number since API expects number
    const roomIdNumber = parseInt(selectedRoomId);
    console.log('Assigning room:', roomIdNumber);
    
    // Close dialog with room ID (as number)
    this.dialogRef.close(roomIdNumber);
  }
} 