import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { AccountFormDialogComponent } from './account-form-dialog/account-form-dialog.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource: MatTableDataSource<Account>;
  displayedColumns: string[] = ['fullname', 'email', 'phone', 'role', 'actions'];
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private accountService: AccountService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Account>([]);
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.dataSource.data = accounts;
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading accounts', error);
          this.snackBar.open('Lỗi tải danh sách tài khoản!', 'Đóng', { duration: 3000 });
          this.dataSource.data = [];
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

  openAccountDialog(account?: Account): void {
    const isEditMode = !!account;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px';
    dialogConfig.maxWidth = '90vw';
    dialogConfig.panelClass = 'account-form-dialog';
    dialogConfig.data = { account };

    const dialogRef = this.dialog.open(AccountFormDialogComponent, dialogConfig);

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Tài khoản đã được ${isEditMode ? 'cập nhật' : 'tạo mới'}!`, 'Đóng', { duration: 3000 });
          this.loadAccounts();
        }
      });
  }

  onCreate(): void {
    this.openAccountDialog();
  }

  onEdit(account: Account): void {
    this.openAccountDialog(account);
  }

  onDelete(account: Account): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa tài khoản',
        message: `Bạn có chắc chắn muốn xóa tài khoản "${account.username}" (${account.fullname}) không? Hành động này không thể hoàn tác.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteAccount(account.id);
      }
    });
  }

  private deleteAccount(accountId: number): void {
    this.isLoading = true;
    this.accountService.deleteAccount(accountId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Xóa tài khoản thành công!', 'Đóng', { duration: 3000 });
          this.loadAccounts();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error deleting account', error);
          this.snackBar.open('Lỗi xóa tài khoản!', 'Đóng', { duration: 3000 });
        }
      });
  }
}
