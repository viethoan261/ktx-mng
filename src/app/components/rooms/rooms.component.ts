import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Room } from '../../models/room.model';
import { RoomFormDialogComponent } from './room-form-dialog/room-form-dialog.component';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  dataSource: MatTableDataSource<Room>;
  displayedColumns: string[] = ['roomNumber', 'floor', 'maxOccupancy', 'status', 'currentOccupancy', 'actions'];
  isLoading = true;

  // For standalone dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  roomToDelete: Room | null = null;

  // Mock data
  mockRooms: Room[] = [
    {
      id: 1,
      roomNumber: '101',
      floor: 1,
      maxOccupancy: 4,
      status: 'occupied',
      currentOccupancy: 3,
      description: 'Phòng đầy đủ tiện nghi',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-10')
    },
    {
      id: 2,
      roomNumber: '201',
      floor: 2,
      maxOccupancy: 4,
      status: 'empty',
      description: 'Phòng mới sửa chữa',
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-02-20')
    },
    {
      id: 3,
      roomNumber: '301',
      floor: 3,
      maxOccupancy: 4,
      status: 'maintenance',
      description: 'Đang sửa chữa hệ thống điện',
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2023-03-15')
    }
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Room>();
  }

  ngOnInit(): void {
    // For mock data
    this.isLoading = false;
    this.rooms = this.mockRooms;
    this.dataSource.data = this.mockRooms;
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

    const dialogRef = this.dialog.open(RoomFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creating new room:', result);
        // TODO: Implement the actual creation logic
      }
    });
  }

  onEdit(room: Room): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'custom-dialog';
    dialogConfig.data = { room };

    const dialogRef = this.dialog.open(RoomFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updating room:', result);
        // TODO: Implement the actual update logic
      }
    });
  }

  onDelete(room: Room): void {
    this.roomToDelete = room;
    this.confirmDialogTitle = 'Xác nhận xóa';
    this.confirmDialogMessage = `Bạn có chắc chắn muốn xóa phòng ${room.roomNumber}?`;
    this.showConfirmDialog = true;
  }

  confirmDeleteRoom(): void {
    if (this.roomToDelete) {
      // TODO: Implement the actual deletion logic
      console.log('Deleting room:', this.roomToDelete);
      this.showConfirmDialog = false;
      this.roomToDelete = null;
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'occupied':
        return 'Đã có người ở';
      case 'empty':
        return 'Trống';
      case 'maintenance':
        return 'Đang bảo trì';
      default:
        return status;
    }
  }
} 