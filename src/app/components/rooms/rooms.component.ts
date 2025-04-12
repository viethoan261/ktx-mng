import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Room } from '../../models/room.model';
import { RoomFormDialogComponent } from './room-form-dialog/room-form-dialog.component';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { RoomService } from '../../services/room.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoomsComponent implements OnInit, OnDestroy, AfterViewInit {
  rooms: Room[] = [];
  dataSource: MatTableDataSource<Room>;
  displayedColumns: string[] = ['roomNumber', 'floorNumber', 'maxOccupancy', 'status', 'currentOccupancy', 'actions'];
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // For dialog
  roomToDelete: Room | null = null;

  constructor(
    private dialog: MatDialog,
    private roomService: RoomService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Room>();
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getRooms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.dataSource.data = rooms;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading rooms:', error);
          this.isLoading = false;
          this.snackBar.open('Không thể tải danh sách phòng', 'Đóng', {
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

    const dialogRef = this.dialog.open(RoomFormDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.roomService.createRoom(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadRooms();
              this.snackBar.open('Thêm phòng thành công', 'Đóng', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error creating room:', error);
              this.isLoading = false;
              this.snackBar.open('Không thể thêm phòng', 'Đóng', {
                duration: 3000
              });
            }
          });
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
        this.isLoading = true;
        this.roomService.updateRoom(room.id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadRooms();
              this.snackBar.open('Cập nhật phòng thành công', 'Đóng', {
                duration: 3000
              });
            },
            error: (error) => {
              console.error('Error updating room:', error);
              this.isLoading = false;
              this.snackBar.open('Không thể cập nhật phòng', 'Đóng', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  onDelete(room: Room): void {
    this.roomToDelete = room;
    
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa phòng ${room.roomNumber}?`
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteRoom();
      }
    });
  }

  confirmDeleteRoom(): void {
    if (this.roomToDelete) {
      this.isLoading = true;
      this.roomService.deleteRoom(this.roomToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadRooms();
            this.snackBar.open('Xóa phòng thành công', 'Đóng', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting room:', error);
            this.isLoading = false;
            this.snackBar.open('Không thể xóa phòng', 'Đóng', {
              duration: 3000
            });
          }
        });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'OCCUPIED':
        return 'Đã có người ở';
      case 'EMPTY':
        return 'Trống';
      case 'MAINTENANCE':
        return 'Đang bảo trì';
      default:
        return status;
    }
  }
} 