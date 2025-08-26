import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill, SkillType, SkillLevel } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private apiUrl = `${environment.backendUrl}`;

  constructor(private http: HttpClient) { }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/skills`);
  }

  getSkillTypes(): Observable<SkillType[]> {
    return this.http.get<SkillType[]>(`${this.apiUrl}/skilltypes`);
  }

  getSkillLevels(): Observable<SkillLevel[]> {
    return this.http.get<SkillLevel[]>(`${this.apiUrl}/skilllevels`);
  }

  getEmployeeSkills(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employeeskills`);
  }

  createEmployeeSkill(employeeSkill: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/employeeskills`, employeeSkill);
  }

  updateEmployeeSkill(employeeId: number, skillId: number, employeeSkill: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/employeeskills/${employeeId}/${skillId}`, employeeSkill);
  }

  deleteEmployeeSkill(employeeId: number, skillId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/employeeskills/${employeeId}/${skillId}`);
  }
}