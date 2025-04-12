export interface Room {
  id: string;
  roomNumber: string;
  floorNumber: string;
  maxOccupancy: number;
  status: 'OCCUPIED' | 'EMPTY' | 'MAINTENANCE';
  currentOccupancy?: number;
  studentIds?: string[];
  students?: any[];
  createdDate?: string;
  modifiedDate?: string;
}

export interface RoomCreateDto {
  roomNumber: string;
  floorNumber: string;
  maxOccupancy: number;
  status: string;
  currentOccupancy: number;
  studentIds: string[];
}

export interface RoomUpdateDto {
  roomNumber: string;
  floorNumber: string;
  maxOccupancy: number;
  status: string;
  currentOccupancy: number;
  studentIds: string[];
} 