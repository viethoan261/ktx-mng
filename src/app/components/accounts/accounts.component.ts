import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  dataSource: MatTableDataSource<Account>;
  displayedColumns: string[] = ['email', 'fullName', 'actions'];
  isLoading = true;

  // Mock data
  mockAccounts: Account[] = [
    {
      id: 1,
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-10')
    },
    {
      id: 2,
      email: 'manager@example.com',
      fullName: 'Manager User',
      role: 'manager',
      status: 'active',
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-02-20')
    },
    {
      id: 3,
      email: 'user@example.com',
      fullName: 'Regular User',
      role: 'user',
      status: 'active',
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2023-03-15')
    }
  ];

  // For standalone dialog
  showConfirmDialog = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  accountToDelete: Account | null = null;

  constructor(
    private accountService: AccountService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Account>();
  }

  ngOnInit(): void {
    // Uncomment this when using real API
    // this.loadAccounts();
    
    // For mock data
    this.isLoading = false;
    this.accounts = this.mockAccounts;
    this.dataSource.data = this.mockAccounts;
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe(
      accounts => {
        this.isLoading = false;
        this.accounts = accounts;
        this.dataSource.data = accounts;
      },
      error => {
        this.isLoading = false;
        console.error('Error loading accounts', error);
      }
    );
  }

  onEdit(account: Account): void {
    // TODO: Implement edit functionality
    console.log('Edit account:', account);
  }

  onDelete(account: Account): void {
    // Method 1: Using standalone component
    this.accountToDelete = account;
    this.confirmDialogTitle = 'Xác nhận xóa';
    this.confirmDialogMessage = `Bạn có chắc chắn muốn xóa tài khoản ${account.email}?`;
    this.showConfirmDialog = true;

    // Method 2: Using MatDialog (commented out but kept for reference)
    /*
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Account',
        message: `Are you sure you want to delete account ${account.email}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAccount(account);
      }
    });
    */
  }

  confirmDeleteAccount(): void {
    if (this.accountToDelete) {
      this.deleteAccount(this.accountToDelete);
      this.showConfirmDialog = false;
      this.accountToDelete = null;
    }
  }

  private deleteAccount(account: Account): void {
    // For mock data, just remove from the array
    this.accounts = this.accounts.filter(a => a.id !== account.id);
    this.dataSource.data = this.accounts;
    
    // Uncomment when using real API
    /*
    this.accountService.deleteAccount(account.id).subscribe(() => {
      this.loadAccounts();
    });
    */
  }
}
