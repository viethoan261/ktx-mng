import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order, OrderItem, OrderRequest } from '../../models/order.model';
import { Room } from '../../models/room.model';
import { OrderService } from '../../services/order.service';
import { RoomService } from '../../services/room.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  rooms: Room[] = [];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  allOrders: Order[] = []; // Store all orders before filtering
  searchQuery: string = '';
  searchSubject = new Subject<string>();
  loading = false;
  loadingOrders = false;
  submitting = false;
  updatingOrderId: number | null = null;
  displayedColumns: string[] = ['roomName', 'electricNumber', 'waterNumber'];
  orderTableColumns: string[] = [];
  orderForm: FormGroup;
  previousMonth: string = '';
  currentMonth: number = 0;
  currentYear: number = 0;
  hasExistingOrders = false;
  userRole: string = '';
  studentId: string = '';
  filterMonth: number = 0; // 0 means all months
  monthsForFilter: {value: number, viewValue: string}[] = [];
  
  constructor(
    private roomService: RoomService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.orderForm = this.fb.group({
      orders: this.fb.array([])
    });
    
    // Set up debounce for search
    this.searchSubject.pipe(
      debounceTime(300) // Wait for 300ms pause in events
    ).subscribe(searchText => {
      this.performSearch(searchText);
    });
  }

  ngOnInit(): void {
    this.getUserInfoFromLocalStorage();
    this.calculatePreviousMonth();
    this.initMonthsForFilter();
    this.setTableColumns();
    this.loadRooms();
    this.loadOrders();
  }

  getUserInfoFromLocalStorage(): void {
    const userInfoString = localStorage.getItem('user_info');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        this.userRole = userInfo.role;
        if (userInfo.id) {
          this.studentId = userInfo.id;
        }
      } catch (error) {
        console.error('Error parsing user info from localStorage', error);
      }
    }
  }

  calculatePreviousMonth(): void {
    const today = new Date();
    
    // Set current month and year (for order filtering)
    this.currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    this.currentYear = today.getFullYear();
    
    // Set default filter month to previous month
    this.filterMonth = this.currentMonth === 1 ? 12 : this.currentMonth - 1;
    
    // Go back one month for order creation
    const prevMonth = new Date(today);
    prevMonth.setMonth(today.getMonth() - 1);
    
    // Format as "MM/YYYY"
    this.previousMonth = `${prevMonth.getMonth() + 1}/${prevMonth.getFullYear()}`;
  }

  initMonthsForFilter(): void {
    this.monthsForFilter = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Add the last 12 months as options
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const monthValue = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      
      this.monthsForFilter.push({
        value: monthValue,
        viewValue: `Tháng ${monthValue}/${year}`
      });
    }
  }

  loadRooms(): void {
    // Only ADMIN needs to load rooms for creating orders
    if (this.userRole !== 'ADMIN') {
      return;
    }
    
    this.loading = true;
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.initFormArray();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms', error);
        this.snackBar.open('Không thể tải danh sách phòng', 'Đóng', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    
    // Different loading strategy based on user role
    if (this.isAdmin()) {
      this.orderService.getOrders().subscribe({
        next: (orders) => {
          this.allOrders = this.sortOrdersByTime(orders); // Store all orders
          
          // Check if orders exist for the "previous month" (the month we'd create orders for)
          // For the current date, we want to create orders for last month
          const today = new Date();
          const previousMonthValue = today.getMonth() === 0 ? 12 : today.getMonth();
          const previousMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          
          // Logic: Orders for month N are created in month N+1
          // So check if there are any orders created in the current month (for previous month)
          const currentMonthValue = today.getMonth() + 1;
          const currentYearValue = today.getFullYear();
          
          const ordersForPreviousMonth = this.allOrders.filter(order => {
            const orderDate = new Date(order.createdDate);
            const orderMonth = orderDate.getMonth() + 1;
            const orderYear = orderDate.getFullYear();
            
            return orderMonth === currentMonthValue && orderYear === currentYearValue;
          });
          
          this.hasExistingOrders = ordersForPreviousMonth.length > 0;
          console.log(`Orders for previous month: ${ordersForPreviousMonth.length}, hasExistingOrders: ${this.hasExistingOrders}`);
          
          // Filter by current month initially
          this.filterOrdersByMonth();
          
          this.loadingOrders = false;
          
          // Enable/disable form based on existing orders
          if (!this.hasExistingOrders && this.isAdmin()) {
            this.orderForm.enable();
          } else {
            this.orderForm.disable();
          }
        },
        error: (error) => {
          console.error('Error loading orders', error);
          this.snackBar.open('Không thể tải hóa đơn', 'Đóng', { duration: 3000 });
          this.loadingOrders = false;
        }
      });
    } else if (this.isStudent()) {
      // For students, load only their orders
      this.orderService.getStudentOrders(this.studentId).subscribe({
        next: (orders) => {
          this.orders = this.sortOrdersByTime(orders);
          this.filteredOrders = [...this.orders];
          this.loadingOrders = false;
          this.orderForm.disable(); // Students can't create orders
        },
        error: (error) => {
          console.error('Error loading student orders', error);
          this.snackBar.open('Không thể tải hóa đơn', 'Đóng', { duration: 3000 });
          this.loadingOrders = false;
        }
      });
    }
  }

  filterOrdersByMonth(): void {
    // Update currentMonth if a specific month is selected
    if (this.filterMonth !== 0) {
      this.currentMonth = this.filterMonth;
    } else {
      // Reset to current month if "All months" is selected
      const today = new Date();
      this.currentMonth = today.getMonth() + 1;
    }
    
    if (this.filterMonth === 0) {
      // Show all orders if no month filter is selected
      this.orders = [...this.allOrders];
    } else {
      // Filter orders by selected month
      // Logic: If we want to see orders for month N, we need to look at orders created in month N+1
      // Because orders created in April are actually for March
      this.orders = this.allOrders.filter(order => {
        const orderDate = new Date(order.createdDate);
        const orderMonth = orderDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        // The month we want to show (filterMonth) is the month before the createdDate month
        // So if orderMonth is 4 (April), it's for month 3 (March)
        const orderForMonth = orderMonth === 1 ? 12 : orderMonth - 1;
        
        return orderForMonth === this.filterMonth;
      });
    }
    
    // Apply current search filter if any
    if (this.searchQuery) {
      this.performSearch(this.searchQuery);
    } else {
      this.filteredOrders = [...this.orders];
    }
  }

  onSearchChange(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchQuery = searchValue;
    this.searchSubject.next(searchValue);
  }

  performSearch(query: string): void {
    if (!query.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }

    const searchText = query.toLowerCase().trim();
    this.filteredOrders = this.orders.filter(order => 
      order.studentName?.toLowerCase().includes(searchText) || 
      order.roomNumber?.toLowerCase().includes(searchText)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredOrders = [...this.orders];
  }

  initFormArray(): void {
    const ordersArray = this.orderForm.get('orders') as FormArray;
    // Clear the form array
    while (ordersArray.length) {
      ordersArray.removeAt(0);
    }
    
    // Add form group for each room
    this.rooms.forEach(room => {
      ordersArray.push(
        this.fb.group({
          roomId: [room.id, Validators.required],
          roomName: [room.roomNumber],
          electricNumberPerMonth: [0, [Validators.required, Validators.min(0)]],
          waterNumberPerMonth: [0, [Validators.required, Validators.min(0)]]
        })
      );
    });
  }

  get ordersArray(): FormArray {
    return this.orderForm.get('orders') as FormArray;
  }

  // Helper method to properly type each control as FormGroup
  getFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  isStudent(): boolean {
    return this.userRole === 'STUDENT';
  }

  onSubmit(): void {
    if (this.orderForm.invalid || this.hasExistingOrders || !this.isAdmin()) {
      return;
    }

    this.submitting = true;
    
    // Prepare request payload
    const orderItems: OrderItem[] = this.ordersArray.controls.map(control => {
      const formGroup = control as FormGroup;
      return {
        roomId: formGroup.get('roomId')?.value,
        electricNumberPerMonth: formGroup.get('electricNumberPerMonth')?.value,
        waterNumberPerMonth: formGroup.get('waterNumberPerMonth')?.value
      };
    });

    const orderRequest: OrderRequest = {
      orders: orderItems
    };

    this.orderService.createOrders(orderRequest).subscribe({
      next: () => {
        this.snackBar.open(`Tạo hóa đơn cho tháng ${this.previousMonth} thành công`, 'Đóng', { 
          duration: 3000 
        });
        this.submitting = false;
        // Reload orders to show the newly created ones
        this.loadOrders();
        // Reset form values to 0
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating orders', error);
        this.snackBar.open('Không thể tạo hóa đơn', 'Đóng', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  updateOrderStatus(orderId: number): void {
    this.updatingOrderId = orderId;

    if (this.isAdmin()) {
      this.orderService.updateOrderStatus(orderId).subscribe({
        next: () => {
          this.snackBar.open(`Thanh toán thành công`, 'Đóng', { duration: 3000 });
          
          // Update local order status
          const orderIndex = this.orders.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'Paid';
            // Also update in filtered orders
            const filteredIndex = this.filteredOrders.findIndex(order => order.id === orderId);
            if (filteredIndex !== -1) {
              this.filteredOrders[filteredIndex].status = 'Paid';
            }
          }
          
          this.updatingOrderId = null;
        },
        error: (error) => {
          console.error('Error updating order status', error);
          this.snackBar.open('Không thể thanh toán hóa đơn', 'Đóng', { duration: 3000 });
          this.updatingOrderId = null;
        }
      });
    } else {

    } 
  }

  canMarkAsPaid(order: Order): boolean {
    return order.status === 'Pending';
  }

  canMarkAsPending(order: Order): boolean {
    return this.isAdmin() && order.status === 'Paid';
  }

  isUpdating(orderId: number): boolean {
    return this.updatingOrderId === orderId;
  }

  resetForm(): void {
    // Reset all electric and water numbers to 0
    this.ordersArray.controls.forEach(control => {
      const formGroup = control as FormGroup;
      formGroup.get('electricNumberPerMonth')?.setValue(0);
      formGroup.get('waterNumberPerMonth')?.setValue(0);
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  sortOrdersByTime(orders: Order[]): Order[] {
    if (!orders) {
      return [];
    }
    
    return orders.sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);
      return dateB.getTime() - dateA.getTime(); // Sort by descending (newest first)
    });
  }

  setTableColumns(): void {
    if (this.isAdmin()) {
      this.orderTableColumns = ['id', 'studentName', 'roomNumber', 'electricNumberPerMonth', 'waterNumberPerMonth', 'electricity', 'water', 'service', 'room', 'total', 'status', 'createdDate', 'actions'];
    } else {
      this.orderTableColumns = ['id', 'roomNumber', 'electricNumberPerMonth', 'waterNumberPerMonth', 'electricity', 'water', 'service', 'room', 'total', 'status', 'createdDate', 'actions'];
    }
  }
} 