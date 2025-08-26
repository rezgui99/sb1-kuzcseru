import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobDescription } from '../models/job-description.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobDescriptionService {
  private apiUrl = `${environment.backendUrl}/jobdescriptions`;

  constructor(private http: HttpClient) { }

  getJobDescriptions(filters?: any): Observable<JobDescription[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<JobDescription[]>(this.apiUrl, { params });
  }

  getJobDescriptionById(id: number): Observable<JobDescription> {
    return this.http.get<JobDescription>(`${this.apiUrl}/${id}`);
  }

  createJobDescription(jobDescription: Partial<JobDescription>): Observable<JobDescription> {
    return this.http.post<JobDescription>(this.apiUrl, jobDescription);
  }

  updateJobDescription(id: number, jobDescription: Partial<JobDescription>): Observable<JobDescription> {
    return this.http.put<JobDescription>(`${this.apiUrl}/${id}`, jobDescription);
  }

  deleteJobDescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchJobDescriptions(query: string): Observable<JobDescription[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<JobDescription[]>(`${this.apiUrl}/search`, { params });
  }
}