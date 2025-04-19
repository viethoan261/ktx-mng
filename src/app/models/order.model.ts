export interface OrderItem {
  roomId: number;
  electricNumberPerMonth: number;
  waterNumberPerMonth: number;
}

export interface OrderRequest {
  orders: OrderItem[];
}

export interface Order {
  id: number;
  studentId: number;
  studentName: string;
  roomId: number;
  roomNumber: string;
  electricity: number;
  water: number;
  service: number;
  room: number;
  total: number;
  status: string;
  electricNumberPerMonth: number;
  waterNumberPerMonth: number;
  createdDate: string;
  modifiedDate: string;
} 