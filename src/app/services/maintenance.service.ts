import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaintenanceTask } from '../models/maintenance.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/MaintenanceTasks`;

  constructor(private http: HttpClient) { }

  // Lấy danh sách công việc bảo trì
  getMaintenanceTasks(): Observable<MaintenanceTask[]> {
    return this.http.get<MaintenanceTask[]>(this.apiUrl);
  }

  // Lấy chi tiết một công việc bảo trì
  getMaintenanceTask(id: number): Observable<MaintenanceTask> {
    return this.http.get<MaintenanceTask>(`${this.apiUrl}/${id}`);
  }

  // Tạo công việc bảo trì mới
  createMaintenanceTask(task: MaintenanceTask): Observable<MaintenanceTask> {
    return this.http.post<MaintenanceTask>(this.apiUrl, task);
  }

  // Cập nhật công việc bảo trì
  updateMaintenanceTask(id: number, task: Partial<MaintenanceTask>): Observable<MaintenanceTask> {
    return this.http.put<MaintenanceTask>(`${this.apiUrl}/${id}`, task);
  }

  // Xóa công việc bảo trì
  deleteMaintenanceTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Cập nhật trạng thái công việc bảo trì
  updateTaskStatus(id: number, status: string): Observable<MaintenanceTask> {
    // Angular HttpClient sẽ tự động chuyển đổi chuỗi status thành JSON
    // Chúng ta cần đảm bảo gửi chuỗi dạng JSON hợp lệ bằng cách đặt nó trong dấu ngoặc kép
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    // Gửi chuỗi có dạng JSON: "IN_PROGRESS" (với các dấu ngoặc kép)
    return this.http.put<MaintenanceTask>(
      `${this.apiUrl}/${id}/status`,
      JSON.stringify(status), // Chuyển đổi chuỗi status thành chuỗi JSON hợp lệ
      { headers }
    );
  }

  // Đánh dấu công việc hoàn thành
  markTaskCompleted(id: number): Observable<MaintenanceTask> {
    const completedDate = new Date().toISOString();
    return this.http.put<MaintenanceTask>(`${this.apiUrl}/${id}/complete`, { 
      status: 'COMPLETED',
      completedDate 
    });
  }

  // Lọc công việc theo loại
  getTasksByType(type: string): Observable<MaintenanceTask[]> {
    return this.http.get<MaintenanceTask[]>(`${this.apiUrl}/type/${type}`);
  }

  // Lọc công việc theo trạng thái
  getTasksByStatus(status: string): Observable<MaintenanceTask[]> {
    return this.http.get<MaintenanceTask[]>(`${this.apiUrl}/status/${status}`);
  }

  // Lọc công việc theo mức độ ưu tiên
  getTasksByPriority(priority: string): Observable<MaintenanceTask[]> {
    return this.http.get<MaintenanceTask[]>(`${this.apiUrl}/priority/${priority}`);
  }

  // Tìm kiếm kết hợp với các bộ lọc
  searchTasks(filters: {type?: string, status?: string, priority?: string}): Observable<MaintenanceTask[]> {
    // Set default parameter values to -1 when not provided
    let params = new HttpParams();
    
    // Add parameters with -1 values when not specified
    params = params.set('type', filters.type !== undefined ? filters.type : '-1');
    params = params.set('status', filters.status !== undefined ? filters.status : '-1');
    params = params.set('priority', filters.priority !== undefined ? filters.priority : '-1');
    
    return this.http.get<MaintenanceTask[]>(`${this.apiUrl}/search`, { params });
  }
} 