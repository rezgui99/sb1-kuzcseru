import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeCardComponent } from '../../components/employee-card/employee-card.component';

@Component({
  selector: 'app-cv-library',
  standalone: true,
  imports: [CommonModule, EmployeeCardComponent],
  templateUrl: './cv-library.component.html',
  styleUrls: ['./cv-library.component.css']
})
export class CvLibraryComponent implements OnInit {
  employees: Employee[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.errorMessage = null;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employees for CV Library:', err);
        this.errorMessage = 'Erreur lors du chargement de la CVthèque. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }
}