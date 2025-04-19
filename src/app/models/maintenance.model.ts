export interface MaintenanceTask {
  id?: number;
  taskType: 'MAINTENANCE' | 'CLEANING';
  title: string;
  description?: string;
  location: string;
  scheduledDate: string;
  completedDate?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string | null;
  notes?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface MaintenanceStaff {
  id: number;
  fullname: string;
  position: string;
}

export interface MaintenanceLocation {
  id: string;
  name: string;
}

export const MaintenanceStatusLabels = {
  'SCHEDULED': 'Đã lên lịch',
  'IN_PROGRESS': 'Đang thực hiện',
  'COMPLETED': 'Hoàn thành',
  'CANCELLED': 'Đã hủy'
};

export const MaintenancePriorityLabels = {
  'LOW': 'Thấp',
  'MEDIUM': 'Trung bình',
  'HIGH': 'Cao',
  'URGENT': 'Khẩn cấp'
};

export const MaintenanceTypeLabels = {
  'MAINTENANCE': 'Bảo trì',
  'CLEANING': 'Vệ sinh'
}; 