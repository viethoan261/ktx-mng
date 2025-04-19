export interface Security {
  id?: number;
  visitorName: string;
  phoneNumber: string;
  studentId: number | string;
  studentName?: string;
  entryTime: string;
  exitTime?: string | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  purpose: string;
  notes?: string;
  createdDate?: string;
  modifiedDate?: string;
}
