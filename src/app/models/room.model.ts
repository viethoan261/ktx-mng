export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  maxOccupancy: number;
  status: 'occupied' | 'empty' | 'maintenance';
  currentOccupancy?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
} 