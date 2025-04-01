export interface Account {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 