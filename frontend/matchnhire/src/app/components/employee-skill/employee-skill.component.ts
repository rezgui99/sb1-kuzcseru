import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-skill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-skill.component.html',
  styleUrls: ['./employee-skill.component.css']
})
export class EmployeeSkillComponent {
  @Input() employeeSkill: any;
  @Input() canEdit: boolean = false;
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  editSkill(): void {
    this.onEdit.emit(this.employeeSkill);
  }

  deleteSkill(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      this.onDelete.emit(this.employeeSkill);
    }
  }

  getSkillLevelClass(value: number): string {
    if (value <= 1) return 'bg-red-100 text-red-800';
    if (value <= 2) return 'bg-yellow-100 text-yellow-800';
    if (value <= 3) return 'bg-blue-100 text-blue-800';
    if (value <= 4) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  }
}