import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PaymentService, TransactionStatus, UpdateTransactionRequest } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent implements OnInit {
  loading = true;
  transactionStatus: TransactionStatus | null = null;
  success = false;
  errorMessage = '';
  
  // VNPay response params
  vnpParams: any = {};
  orderUpdated = false;
  transactionUpdated = false;
  fallbackMode = false;
  manualChecking = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Check if we have any query parameters
    this.route.queryParams.subscribe(params => {
      console.log('Payment callback params:', params);
      
      // If no params or empty params, we might be in a fallback situation
      if (!params || Object.keys(params).length === 0) {
        this.handleMissingParams();
        return;
      }
      
      this.vnpParams = params;
      
      const orderId = params['vnp_TxnRef'];
      const responseCode = params['vnp_ResponseCode'];
      
      // VNPay returns '00' for successful transactions
      const isVnpaySuccess = responseCode === '00';
      
      if (orderId) {
        if (isVnpaySuccess) {
          // Xử lý trực tiếp thành công từ tham số URL
          this.success = true;
          this.processSuccessfulPayment(params);
        } else {
          // VNPay indicated failure, get the error message
          this.errorMessage = this.getErrorMessage(responseCode);
          this.loading = false;
          this.success = false;
        }
      } else {
        this.errorMessage = 'Không tìm thấy mã hóa đơn';
        this.loading = false;
      }
    });
  }

  processSuccessfulPayment(params: any): void {
    try {
      // Tạo đối tượng transactionStatus từ các tham số URL
      this.transactionStatus = {
        orderId: params['vnp_TxnRef'],
        status: 'Success',
        message: 'Giao dịch thành công',
        amount: parseInt(params['vnp_Amount']) / 100, // VNPay trả về số tiền * 100
        transactionId: params['vnp_TransactionNo'] || '',
        transactionDate: this.formatVnpDate(params['vnp_PayDate'] || '')
      };
      
      // Cập nhật trạng thái đơn hàng
      this.updateOrderStatus(params['vnp_TxnRef']);
      
      // Cập nhật trạng thái giao dịch
      if (params['vnp_TransactionNo']) {
        this.updateTransactionStatus(params['vnp_TxnRef'], params['vnp_TransactionNo']);
      }
      
      this.snackBar.open('Thanh toán thành công', 'Đóng', { duration: 5000 });
    } catch (error) {
      console.error('Error processing payment params:', error);
      this.errorMessage = 'Lỗi khi xử lý kết quả thanh toán';
      this.success = false;
    }
    
    this.loading = false;
  }

  formatVnpDate(vnpDate: string): string {
    if (!vnpDate || vnpDate.length < 14) return new Date().toISOString();
    
    try {
      // VNPay date format: YYYYMMDDHHmmss
      const year = vnpDate.substring(0, 4);
      const month = vnpDate.substring(4, 6);
      const day = vnpDate.substring(6, 8);
      const hour = vnpDate.substring(8, 10);
      const minute = vnpDate.substring(10, 12);
      const second = vnpDate.substring(12, 14);
      
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    } catch (e) {
      return new Date().toISOString();
    }
  }

  handleMissingParams(): void {
    this.fallbackMode = true;
    this.loading = false;
    this.errorMessage = 'Không nhận được thông tin giao dịch từ VNPay';
    this.snackBar.open(
      'Chưa nhận được thông tin từ VNPay. Bạn có thể kiểm tra giao dịch thủ công.',
      'Kiểm tra giao dịch',
      { duration: 10000 }
    ).onAction().subscribe(() => {
      this.showManualOrderCheck();
    });
  }

  showManualOrderCheck(): void {
    this.manualChecking = true;
  }

  checkOrderById(event: Event): void {
    event.preventDefault();
    const orderIdInput = document.getElementById('manualOrderId') as HTMLInputElement;
    if (!orderIdInput || !orderIdInput.value) {
      this.snackBar.open('Vui lòng nhập mã hóa đơn', 'Đóng', { duration: 3000 });
      return;
    }

    const orderId = orderIdInput.value.trim();
    this.loading = true;
    this.checkTransactionStatus(orderId);
  }

  getErrorMessage(responseCode: string): string {
    // VNPay response code mapping
    const errorMessages: {[key: string]: string} = {
      '01': 'Giao dịch đã tồn tại',
      '02': 'Merchant không hợp lệ',
      '03': 'Dữ liệu gửi sang không đúng định dạng',
      '04': 'Khởi tạo thanh toán không thành công',
      '13': 'Giao dịch thất bại',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
      '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '99': 'Lỗi không xác định'
    };
    
    return errorMessages[responseCode] || 'Thanh toán không thành công';
  }

  // Giữ lại phương thức này để kiểm tra thủ công
  checkTransactionStatus(orderId: string): void {
    this.paymentService.getTransactionStatus(orderId).subscribe({
      next: (status) => {
        this.transactionStatus = status;
        
        // In case of discrepancy, backend status takes precedence
        if (status.status === 'Success') {
          this.success = true;
          this.snackBar.open('Thanh toán thành công', 'Đóng', { duration: 5000 });
          
          // Update order status if payment is successful
          this.updateOrderStatus(orderId);
          
          // Cập nhật trạng thái giao dịch nếu có thông tin transactionId
          if (status.transactionId) {
            this.updateTransactionStatus(orderId, status.transactionId);
          }
        } else {
          // Only update error message if we don't already have one from VNPay
          if (!this.errorMessage) {
            this.errorMessage = status.message || 'Thanh toán không thành công';
          }
          this.success = false;
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error checking transaction status', error);
        this.errorMessage = 'Không thể kiểm tra trạng thái thanh toán';
        this.success = false;
        this.loading = false;
      }
    });
  }

  updateOrderStatus(orderId: string): void {
    if (this.orderUpdated) {
      return; // Prevent duplicate updates
    }
    
    const numericOrderId = parseInt(orderId, 10);
    if (isNaN(numericOrderId)) {
      console.error('Invalid order ID for status update:', orderId);
      return;
    }
    
    this.orderService.updateOrderStatus(numericOrderId).subscribe({
      next: () => {
        console.log('Order status updated successfully:', orderId);
        this.orderUpdated = true;
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        // Don't show error to user as payment was still successful
      }
    });
  }

  updateTransactionStatus(orderId: string, transactionId: string): void {
    if (this.transactionUpdated) {
      return; // Prevent duplicate updates
    }
    
    const updateRequest: UpdateTransactionRequest = {
      OrderId: orderId,
      TransactionId: transactionId
    };
    
    this.paymentService.updateTransaction(updateRequest).subscribe({
      next: () => {
        console.log('Transaction status updated successfully');
        this.transactionUpdated = true;
      },
      error: (error) => {
        console.error('Error updating transaction status:', error);
        // Don't show error to user as payment was still successful
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
} 