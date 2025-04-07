export interface Account {
  id: number;
  username: string;
  fullname: string;
  role: string;
  email: string;
  phone: string;
  password?: string;
  createdDate?: string | Date;
  modifiedDate?: string | Date;
} 