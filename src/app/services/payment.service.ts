import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreatePaymentRequest {
  Amount: number;
  OrderDescription: string;
  OrderType: string;
  OrderId: string;
  Name: string;
  ReturnUrl: string;
}

export interface TransactionStatus {
  orderId: string;
  status: string;
  message: string;
  amount: number;
  transactionId: string;
  transactionDate: string;
}

export interface VerifyPaymentRequest {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo?: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface UpdateTransactionRequest {
  OrderId: string;
  TransactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/Payment`;

  constructor(private http: HttpClient) { }

  /**
   * Create a payment request to VNPay
   */
  createPayment(request: CreatePaymentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-payment`, request);
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(orderId: string): Observable<TransactionStatus> {
    return this.http.get<TransactionStatus>(`${this.apiUrl}/transaction-status/${orderId}`);
  }

  /**
   * Verify a payment with VNPay callback params
   */
  verifyPayment(params: any): Observable<TransactionStatus> {
    return this.http.post<TransactionStatus>(`${this.apiUrl}/payment-callback`, params);
  }

  /**
   * Update transaction status
   */
  updateTransaction(request: UpdateTransactionRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-transaction`, request);
  }

  /**
   * Get user transactions
   */
  getUserTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user-transactions`);
  }
} 