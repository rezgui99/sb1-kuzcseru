import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.backendUrl}/employees`;
  private jobDescriptionEmployeeUrl = `${environment.backendUrl}/jobdescriptionemployee`;

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Méthodes pour le controller jobdescriptionemployee
  getEmployeesByJobDescription(jobDescriptionId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.jobDescriptionEmployeeUrl}/job/${jobDescriptionId}`);
  }

  getJobDescriptionsByEmployee(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.jobDescriptionEmployeeUrl}/employee/${employeeId}`);
  }

  assignEmployeeToJobDescription(employeeId: number, jobDescriptionId: number): Observable<any> {
    return this.http.post<any>(`${this.jobDescriptionEmployeeUrl}`, {
      employee_id: employeeId,
      job_description_id: jobDescriptionId
    });
  }

  unassignEmployeeFromJobDescription(employeeId: number, jobDescriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.jobDescriptionEmployeeUrl}/${employeeId}/${jobDescriptionId}`);
  }

  getAllJobDescriptionEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.jobDescriptionEmployeeUrl}`);
  }
}