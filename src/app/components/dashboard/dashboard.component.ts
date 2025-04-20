import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../components/notifications/notification-form-dialog/notification-form-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { StatisticsService, RoomStatistics, BillStatistics } from '../../services/statistics.service';
import { OrderService } from '../../services/order.service';
import { RequestService, Request } from '../../services/request.service';
import { Order } from '../../models/order.model';
import { PaymentService, CreatePaymentRequest } from '../../services/payment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  recentNotifications: Notification[] = [];
  isLoading = true;
  userRole: string = '';
  private destroy$ = new Subject<void>();

  // Student data
  studentOrders: Order[] = [];
  loadingOrders = false;
  studentRequests: Request[] = [];
  loadingRequests = false;

  // Room statistics
  roomStats: RoomStatistics | null = null;
  loadingRoomStats = false;
  
  // Bill statistics
  billStats: BillStatistics | null = null;
  loadingBillStats = false;
  selectedYear = new Date().getFullYear(); // Default to current year
  availableYears: number[] = [];
  
  // Prepared data for charts
  roomStatusData: any[] = [];
  roomOccupancyData: any[] = [];
  
  // Months for display
  months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Add property to track order being processed
  processingOrderId: number | null = null;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private orderService: OrderService,
    private requestService: RequestService,
    private paymentService: PaymentService
  ) { 
    // Tạo danh sách các năm từ 2020 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= currentYear; year++) {
      this.availableYears.push(year);
    }
  }

  ngOnInit(): void {
    // Get user role
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userRole = currentUser.role;
    }
    
    this.loadRecentNotifications();
    
    // Load room statistics if user is admin
    if (this.userRole === 'ADMIN') {
      this.loadRoomStatistics();
      this.loadBillStatistics();
    } else {
      // Load student data if user is not admin
      this.loadStudentOrders();
      this.loadStudentRequests();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecentNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          // Filter for active notifications and sort by ID (newest first)
          const activeNotifications = notifications
            .filter(notification => notification.status === 'active')
            .sort((a, b) => {
              // Sắp xếp theo ID giảm dần (ID cao nhất lên đầu)
              return (b.id || 0) - (a.id || 0);
            })
            .slice(0, 5); // Chỉ lấy 5 thông báo mới nhất
          
          this.recentNotifications = activeNotifications;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading notifications', error);
          this.snackBar.open('Không thể tải thông báo. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
          this.recentNotifications = [];
        }
      });
  }

  // Method to refresh notifications
  refreshNotifications(): void {
    this.loadRecentNotifications();
  }

  // Load room statistics
  loadRoomStatistics(): void {
    this.loadingRoomStats = true;
    this.statisticsService.getRoomStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.roomStats = stats;
          this.loadingRoomStats = false;
          this.prepareChartData();
        },
        error: (error) => {
          this.loadingRoomStats = false;
          console.error('Error loading room statistics', error);
          this.snackBar.open('Không thể tải thống kê phòng. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
        }
      });
  }
  
  // Load bill statistics
  loadBillStatistics(): void {
    this.loadingBillStats = true;
    this.statisticsService.getBillStatistics(this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.billStats = stats;
          this.loadingBillStats = false;
        },
        error: (error) => {
          this.loadingBillStats = false;
          console.error('Error loading bill statistics', error);
          this.snackBar.open('Không thể tải thống kê hóa đơn. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
        }
      });
  }
  
  // Change year and reload bill statistics
  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadBillStatistics();
  }

  // Prepare data for charts
  prepareChartData(): void {
    if (!this.roomStats) return;

    // Prepare room status chart data
    this.roomStatusData = Object.entries(this.roomStats.StatusCounts).map(([key, value]) => {
      return {
        name: this.translateRoomStatus(key),
        value: value
      };
    });

    // Prepare room occupancy chart data
    this.roomOccupancyData = this.roomStats.RoomsOccupancy.map(room => {
      return {
        name: `Phòng ${room.RoomNumber} (Tầng ${room.FloorNumber})`,
        series: [
          {
            name: 'Sử dụng',
            value: room.CurrentOccupancy
          },
          {
            name: 'Còn trống',
            value: room.MaxOccupancy - room.CurrentOccupancy
          }
        ]
      };
    });
  }

  // Translate room status
  translateRoomStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'OCCUPIED': 'Đã sử dụng',
      'AVAILABLE': 'Còn trống',
      'MAINTENANCE': 'Bảo trì',
      'RESERVED': 'Đã đặt'
    };
    return statusMap[status] || status;
  }

  // Tính tổng số sinh viên đang ở
  getTotalStudents(): number {
    if (!this.roomStats || !this.roomStats.RoomsOccupancy) return 0;
    
    return this.roomStats.RoomsOccupancy.reduce(function(sum, room) {
      return sum + room.CurrentOccupancy;
    }, 0);
  }
  
  // Tính tổng số chỗ còn trống
  getTotalVacancies(): number {
    if (!this.roomStats || !this.roomStats.RoomsOccupancy) return 0;
    
    return this.roomStats.RoomsOccupancy.reduce(function(sum, room) {
      return sum + (room.MaxOccupancy - room.CurrentOccupancy);
    }, 0);
  }
  
  // Lấy giá trị lớn nhất của TotalBills từ thống kê hóa đơn
  getMaxBillValue(): number {
    if (!this.billStats || !this.billStats.MonthlyStatistics) return 0;
    
    return Math.max(...this.billStats.MonthlyStatistics.map(stat => 
      Math.max(stat.TotalBills, stat.PaidBills, stat.UnpaidBills)
    ));
  }

  // Refresh statistics
  refreshStatistics(): void {
    if (this.userRole === 'ADMIN') {
      this.loadRoomStatistics();
      this.loadBillStatistics();
    }
  }

  // Thêm phương thức để lấy danh sách hóa đơn của sinh viên
  loadStudentOrders(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    this.loadingOrders = true;
    this.orderService.getStudentOrders(currentUser.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders: Order[]) => {
          // Chỉ lấy các hóa đơn có status là 'PENDING'
          this.studentOrders = orders.filter((order: Order) => order.status === 'Pending')
            .sort((a: Order, b: Order) => {
              // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
              return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });
          this.loadingOrders = false;
        },
        error: (error: any) => {
          this.loadingOrders = false;
          console.error('Error loading student orders', error);
          this.snackBar.open('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
        }
      });
  }

  // Thêm phương thức để lấy danh sách yêu cầu của sinh viên
  loadStudentRequests(): void {
    this.loadingRequests = true;
    this.requestService.getRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests: Request[]) => {
          // Chỉ lấy các request có status là 'PENDING'
          this.studentRequests = requests
            .filter((request: Request) => request.status === 'PENDING')
            .sort((a: Request, b: Request) => {
              // Sắp xếp theo ngày tạo giảm dần (mới nhất lên đầu)
              return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });
          this.loadingRequests = false;
        },
        error: (error: any) => {
          this.loadingRequests = false;
          console.error('Error loading student requests', error);
          this.snackBar.open('Không thể tải danh sách yêu cầu. Vui lòng thử lại sau!', 'Đóng', { 
            duration: 3000 
          });
        }
      });
  }

  // Refresh student data
  refreshStudentData(): void {
    this.loadStudentOrders();
    this.loadStudentRequests();
  }

  // Process payment for an order
  processPayment(order: Order): void {
    if (!order) return;
    
    this.processingOrderId = order.id;
    
    const paymentRequest: CreatePaymentRequest = {
      Amount: order.total,
      OrderDescription: `Thanh toán hóa đơn KTX #${order.id}`,
      OrderType: 'Dormitory',
      OrderId: order.id.toString(),
      Name: order.studentName,
      ReturnUrl: `${window.location.origin}/payment-result`
    };

    this.paymentService.createPayment(paymentRequest).subscribe({
      next: (response) => {
        if (response && response.paymentUrl) {
          try {
            // Try to open in the same tab first
            window.location.href = response.paymentUrl;
            
            // Set a timeout to check if the page didn't navigate away
            setTimeout(() => {
              // If we're still here after timeout, try to open in a new tab
              window.open(response.paymentUrl, '_blank');
              
              // Also provide a manual link option
              this.snackBar.open(
                'Có vấn đề khi chuyển hướng đến trang thanh toán. Vui lòng thử lại hoặc nhấp vào liên kết.', 
                'Mở trang thanh toán', 
                { 
                  duration: 10000,
                  panelClass: ['payment-snackbar']
                }
              ).onAction().subscribe(() => {
                window.open(response.paymentUrl, '_blank');
              });
            }, 1000);
          } catch (e) {
            // If redirection fails, offer a fallback option
            console.error('Failed to redirect to payment page:', e);
            this.snackBar.open(
              'Không thể tự động chuyển hướng đến trang thanh toán.', 
              'Mở trang thanh toán', 
              { 
                duration: 10000,
                panelClass: ['payment-snackbar']
              }
            ).onAction().subscribe(() => {
              window.open(response.paymentUrl, '_blank');
            });
          }
        } else {
          this.snackBar.open('Không thể khởi tạo thanh toán', 'Đóng', { duration: 3000 });
        }
        this.processingOrderId = null;
      },
      error: (error) => {
        console.error('Error creating payment', error);
        this.snackBar.open('Không thể khởi tạo thanh toán', 'Đóng', { duration: 3000 });
        this.processingOrderId = null;
      }
    });
  }
  
  // Helper method to check if an order is being processed
  isProcessing(orderId: number): boolean {
    return this.processingOrderId === orderId;
  }
}
