import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EmployeeService } from '../../services/employee.service';
import { SkillService } from '../../services/skill.service';
import { Employee, Skill, SkillType } from '../../models/employee.model';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('skillTypeChart') skillTypeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('employeePositionChart') employeePositionChartRef!: ElementRef<HTMLCanvasElement>;

  loading: boolean = true;
  errorMessage: string | null = null;
  
  // Charts
  skillTypeChart: Chart | null = null;
  employeePositionChart: Chart | null = null;
  
  // Data flags
  hasSkillTypeData: boolean = false;
  hasEmployeePositionData: boolean = false;
  
  // Statistics
  totalEmployees: number = 0;
  totalSkills: number = 0;
  totalPositions: number = 0;

  constructor(
    private employeeService: EmployeeService,
    private skillService: SkillService
  ) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  async loadStatistics(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    
    try {
      const [employees, skillTypes] = await Promise.all([
        this.employeeService.getEmployees().toPromise(),
        this.skillService.getSkillTypes().toPromise()
      ]);

      if (employees && skillTypes) {
        this.totalEmployees = employees.length;
        this.processSkillTypeDistribution(employees, skillTypes);
        this.processEmployeePositionDistribution(employees);
        this.calculateTotalSkills(employees);
      } else {
        this.errorMessage = 'Données manquantes pour les statistiques.';
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
      this.errorMessage = 'Erreur lors du chargement des statistiques. Veuillez vérifier la connexion au backend.';
    } finally {
      this.loading = false;
    }
  }

  private processSkillTypeDistribution(employees: Employee[], skillTypes: SkillType[]): void {
    const skillTypeCounts: { [key: string]: number } = {};
    const skillTypeMap = new Map<number, string>(skillTypes.map(type => [type.id, type.type_name]));

    employees.forEach(employee => {
      employee.skills?.forEach(empSkill => {
        if (empSkill.skill?.skill_type_id) {
          const typeName = skillTypeMap.get(empSkill.skill.skill_type_id);
          if (typeName) {
            skillTypeCounts[typeName] = (skillTypeCounts[typeName] || 0) + 1;
          }
        }
      });
    });

    const labels = Object.keys(skillTypeCounts);
    const data = Object.values(skillTypeCounts);
    
    this.hasSkillTypeData = labels.length > 0;
    
    if (this.hasSkillTypeData) {
      this.createSkillTypeChart(labels, data);
    }
  }

  private processEmployeePositionDistribution(employees: Employee[]): void {
    const positionCounts: { [key: string]: number } = {};

    employees.forEach(employee => {
      if (employee.position) {
        positionCounts[employee.position] = (positionCounts[employee.position] || 0) + 1;
      }
    });

    const labels = Object.keys(positionCounts);
    const data = Object.values(positionCounts);
    
    this.totalPositions = labels.length;
    this.hasEmployeePositionData = labels.length > 0;
    
    if (this.hasEmployeePositionData) {
      this.createEmployeePositionChart(labels, data);
    }
  }

  private calculateTotalSkills(employees: Employee[]): void {
    const uniqueSkills = new Set<number>();
    employees.forEach(employee => {
      employee.skills?.forEach(empSkill => {
        if (empSkill.skill?.id) {
          uniqueSkills.add(empSkill.skill.id);
        }
      });
    });
    this.totalSkills = uniqueSkills.size;
  }

  private createSkillTypeChart(labels: string[], data: number[]): void {
    if (this.skillTypeChart) {
      this.skillTypeChart.destroy();
    }

    const ctx = this.skillTypeChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.skillTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#2196F3', // Primary blue
              '#FFC107', // Secondary yellow
              '#4CAF50', // Green
              '#FF5722', // Orange
              '#9C27B0', // Purple
              '#00BCD4', // Cyan
              '#795548'  // Brown
            ],
            hoverBackgroundColor: [
              '#1976D2',
              '#FFA000',
              '#388E3C',
              '#E64A19',
              '#7B1FA2',
              '#0097A7',
              '#5D4037'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((sum: any, current: any) => sum + current, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  private createEmployeePositionChart(labels: string[], data: number[]): void {
    if (this.employeePositionChart) {
      this.employeePositionChart.destroy();
    }

    const ctx = this.employeePositionChartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.employeePositionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre d\'employés',
            data: data,
            backgroundColor: '#2196F3',
            borderColor: '#1976D2',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.skillTypeChart) {
      this.skillTypeChart.destroy();
    }
    if (this.employeePositionChart) {
      this.employeePositionChart.destroy();
    }
  }
}