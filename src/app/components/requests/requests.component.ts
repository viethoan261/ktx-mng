import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestService, Request } from '../../services/request.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'studentName', 'title', 'type', 'status', 'createdDate', 'actions'];
  dataSource = new MatTableDataSource<Request>([]);
  isLoading = false;
  isAdmin = false;
  statusColors = {
    'PENDING': '#FFC107', // Yellow
    'APPROVED': '#4CAF50', // Green
    'REJECTED': '#F44336', // Red
    'RESOLVED': '#2196F3'  // Blue
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private requestService: RequestService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private authService: AuthService,
    private overlay: Overlay
  ) { 
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRequests() {
    this.isLoading = true;
    this.requestService.getRequests().subscribe({
      next: (requests) => {
        console.log('Received requests data:', requests);
        this.dataSource.data = requests;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading requests', error);
        this.isLoading = false;
        this.snackBar.open('Không thể tải dữ liệu yêu cầu', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  viewDetails(request: Request) {
    // Fix accessibility by explicitly removing aria-hidden from app-root
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }
    
    // Implementation for viewing request details
    this.dialog.open(RequestDetailDialogComponent, {
      width: '600px',
      data: { request },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });
  }

  approveRequest(id: number) {
    // Fix accessibility by explicitly removing aria-hidden from app-root
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }

    const dialogRef = this.dialog.open(ResponseDialogComponent, {
      width: '450px',
      data: { 
        title: 'Phê duyệt yêu cầu', 
        message: 'Vui lòng nhập thông tin phê duyệt:',
        actionText: 'Phê duyệt',
        status: 'APPROVED',
        buttonColor: 'primary'
      },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.response !== undefined) {
        this.requestService.updateRequest(id, { 
          status: 'APPROVED',
          response: result.response 
        }).subscribe({
          next: () => {
            this.snackBar.open('Phê duyệt yêu cầu thành công', 'Đóng', {
              duration: 3000
            });
            this.loadRequests();
          },
          error: (error) => {
            console.error('Error approving request', error);
            this.snackBar.open('Không thể phê duyệt yêu cầu', 'Đóng', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  rejectRequest(id: number) {
    // Fix accessibility by explicitly removing aria-hidden from app-root
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }
    
    const dialogRef = this.dialog.open(ResponseDialogComponent, {
      width: '450px',
      data: { 
        title: 'Từ chối yêu cầu', 
        message: 'Vui lòng nhập lý do từ chối:',
        actionText: 'Từ chối',
        status: 'REJECTED',
        buttonColor: 'warn'
      },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.response !== undefined) {
        this.requestService.updateRequest(id, { 
          status: 'REJECTED',
          response: result.response 
        }).subscribe({
          next: () => {
            this.snackBar.open('Từ chối yêu cầu thành công', 'Đóng', {
              duration: 3000
            });
            this.loadRequests();
          },
          error: (error) => {
            console.error('Error rejecting request', error);
            this.snackBar.open('Không thể từ chối yêu cầu', 'Đóng', {
              duration: 3000
            });
          }
        });
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

  getStatusColor(status: string): string {
    return this.statusColors[status as keyof typeof this.statusColors] || '#757575';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  createRequest() {
    // Fix accessibility by explicitly removing aria-hidden from app-root
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }
    
    const dialogRef = this.dialog.open(RequestFormDialogComponent, {
      width: '600px',
      data: { title: 'Tạo yêu cầu mới' },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.requestService.createRequest(result).subscribe({
          next: () => {
            this.snackBar.open('Tạo yêu cầu thành công', 'Đóng', {
              duration: 3000
            });
            this.loadRequests();
          },
          error: (error) => {
            console.error('Error creating request:', error);
            this.isLoading = false;
            this.snackBar.open('Không thể tạo yêu cầu', 'Đóng', {
              duration: 3000
            });
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-request-detail-dialog',
  template: `
    <h2 mat-dialog-title>Chi tiết yêu cầu</h2>
    <mat-dialog-content>
      <div class="request-detail">
        <div class="detail-row">
          <strong>Tiêu đề:</strong> {{data.request.title}}
        </div>
        <div class="detail-row">
          <strong>Người tạo:</strong> {{data.request.studentName}}
        </div>
        <div class="detail-row">
          <strong>Loại:</strong> {{data.request.type}}
        </div>
        <div class="detail-row">
          <strong>Trạng thái:</strong> 
          <span class="status-badge" [style.background-color]="getStatusColor(data.request.status)">
            {{data.request.status}}
          </span>
        </div>
        <div class="detail-row">
          <strong>Ngày tạo:</strong> {{formatDate(data.request.createdDate)}}
        </div>
        <div class="detail-row content-row">
          <strong>Nội dung:</strong>
          <div class="content-block">{{data.request.content}}</div>
        </div>
        <div class="detail-row" *ngIf="data.request.response">
          <strong>Phản hồi:</strong>
          <div class="content-block">{{data.request.response}}</div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Đóng</button>
      <ng-container *ngIf="isAdmin && data.request.status === 'PENDING'">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="approveRequest()">
          Phê duyệt
        </button>
        <button 
          mat-raised-button 
          color="warn" 
          (click)="rejectRequest()">
          Từ chối
        </button>
      </ng-container>
    </mat-dialog-actions>
  `,
  styles: [`
    .request-detail {
      padding: 10px 0;
    }
    .detail-row {
      margin-bottom: 15px;
    }
    .content-row {
      display: flex;
      flex-direction: column;
    }
    .content-block {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 5px;
      white-space: pre-wrap;
    }
    .status-badge {
      padding: 3px 8px;
      border-radius: 12px;
      color: white;
      font-size: 12px;
      display: inline-block;
    }
  `]
})
export class RequestDetailDialogComponent {
  isAdmin = false;

  constructor(
    public dialogRef: MatDialogRef<RequestDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {request: Request},
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  getStatusColor(status: string): string {
    const statusColors = {
      'PENDING': '#FFC107',
      'APPROVED': '#4CAF50',
      'REJECTED': '#F44336',
      'RESOLVED': '#2196F3'
    };
    return statusColors[status as keyof typeof statusColors] || '#757575';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  approveRequest() {
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }

    const responseDialog = this.dialog.open(ResponseDialogComponent, {
      width: '450px',
      data: { 
        title: 'Phê duyệt yêu cầu', 
        message: 'Vui lòng nhập thông tin phê duyệt:',
        actionText: 'Phê duyệt',
        status: 'APPROVED',
        buttonColor: 'primary'
      },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    responseDialog.afterClosed().subscribe((result: {response: string, status: string} | undefined) => {
      if (result && result.response !== undefined) {
        this.requestService.updateRequest(this.data.request.id, { 
          status: 'APPROVED',
          response: result.response 
        }).subscribe({
          next: () => {
            this.snackBar.open('Phê duyệt yêu cầu thành công', 'Đóng', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Không thể phê duyệt yêu cầu', 'Đóng', { duration: 3000 });
          }
        });
      }
    });
  }

  rejectRequest() {
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.removeAttribute('aria-hidden');
    }

    const responseDialog = this.dialog.open(ResponseDialogComponent, {
      width: '450px',
      data: { 
        title: 'Từ chối yêu cầu', 
        message: 'Vui lòng nhập lý do từ chối:',
        actionText: 'Từ chối',
        status: 'REJECTED',
        buttonColor: 'warn'
      },
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: true,
      restoreFocus: true
    });

    responseDialog.afterClosed().subscribe((result: {response: string, status: string} | undefined) => {
      if (result && result.response !== undefined) {
        this.requestService.updateRequest(this.data.request.id, { 
          status: 'REJECTED',
          response: result.response 
        }).subscribe({
          next: () => {
            this.snackBar.open('Từ chối yêu cầu thành công', 'Đóng', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: () => {
            this.snackBar.open('Không thể từ chối yêu cầu', 'Đóng', { duration: 3000 });
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-request-form-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <form [formGroup]="requestForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tiêu đề</mat-label>
          <input matInput formControlName="title" placeholder="Nhập tiêu đề yêu cầu" required>
          <mat-error *ngIf="requestForm.get('title')?.hasError('required')">
            Tiêu đề là bắt buộc
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Loại yêu cầu</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="REQUEST">Yêu cầu</mat-option>
            <mat-option value="COMPLAINT">Khiếu nại</mat-option>
          </mat-select>
          <mat-error *ngIf="requestForm.get('type')?.hasError('required')">
            Loại yêu cầu là bắt buộc
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nội dung</mat-label>
          <textarea matInput formControlName="content" rows="6" placeholder="Mô tả chi tiết yêu cầu" required></textarea>
          <mat-error *ngIf="requestForm.get('content')?.hasError('required')">
            Nội dung là bắt buộc
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Hủy</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="requestForm.invalid">Gửi yêu cầu</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    textarea {
      min-height: 100px;
    }
  `]
})
export class RequestFormDialogComponent {
  requestForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RequestFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      type: ['REQUEST', Validators.required]
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      const userData = this.authService.getCurrentUser();
      const request = {
        ...this.requestForm.value,
        studentId: userData?.id || null,
        status: 'PENDING'
      };
      this.dialogRef.close(request);
    }
  }
}

@Component({
  selector: 'app-response-dialog',
  template: `
    <h2 mat-dialog-title>{{data.title}}</h2>
    <mat-dialog-content>
      <p>{{data.message}}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Phản hồi</mat-label>
        <textarea matInput [(ngModel)]="response" rows="4" placeholder="Nhập phản hồi"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Hủy</button>
      <button 
        mat-raised-button 
        [color]="data.buttonColor" 
        [disabled]="!response.trim()"
        (click)="onConfirm()">
        {{data.actionText}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    textarea {
      min-height: 80px;
    }
  `]
})
export class ResponseDialogComponent {
  response: string = '';

  constructor(
    public dialogRef: MatDialogRef<ResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close({
      response: this.response,
      status: this.data.status
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
} 