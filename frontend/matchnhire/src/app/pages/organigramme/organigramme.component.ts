import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { JobDescriptionService } from '../../services/job-description.service';
import { Employee } from '../../models/employee.model';
import { JobDescription } from '../../models/job-description.model';

@Component({
  selector: 'app-organigramme',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organigramme.component.html',
  styleUrls: ['./organigramme.component.css']
})
export class OrganigrammeComponent implements OnInit {
  employees: Employee[] = [];
  jobDescriptions: JobDescription[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private jobDescriptionService: JobDescriptionService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    Promise.all([
      this.employeeService.getEmployees().toPromise(),
      this.jobDescriptionService.getJobDescriptions().toPromise()
    ]).then(([employees, jobDescriptions]) => {
      this.employees = employees || [];
      this.jobDescriptions = jobDescriptions || [];
      this.loading = false;
    }).catch(err => {
      console.error('Error loading organizational data:', err);
      this.errorMessage = 'Erreur lors du chargement des données organisationnelles.';
      this.loading = false;
    });
  }

  getEmployeesForJob(jobId: number): Employee[] {
    return this.employees.filter(emp => emp.job_description_id === jobId);
  }

  getJobDescription(jobId: number): JobDescription | undefined {
    return this.jobDescriptions.find(job => job.id === jobId);
  }

  getSuperieurName(superieurId: number): string {
    const job = this.jobDescriptions.find(j => j.id === superieurId);
    return job ? job.emploi : `Job ${superieurId}`;
  }
}