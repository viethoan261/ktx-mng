export interface Price {
  id?: number;
  electricityPrice: number;
  waterPrice: number;
  servicePrice: number;
  roomPrice: number;
  createdDate?: Date;
  modifiedDate?: Date;
} 