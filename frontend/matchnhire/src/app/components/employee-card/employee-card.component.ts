import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/employee.model';
import { SkillBadgeComponent } from '../skill-badge/skill-badge.component';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule, SkillBadgeComponent],
  templateUrl: './employee-card.component.html',
  styleUrls: ['./employee-card.component.css']
})
export class EmployeeCardComponent {
  @Input() employee!: Employee;
  @Input() matchingScore?: number;
  showAllSkills: boolean = false;

  toggleSkills() {
    this.showAllSkills = !this.showAllSkills;
  }
}