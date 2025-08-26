import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { SkillService } from '../../services/skill.service';
import { Employee, Skill, SkillType, SkillLevel } from '../../models/employee.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  employee: Employee | null = null;
  profileForm: FormGroup;
  skills: Skill[] = [];
  skillTypes: SkillType[] = [];
  skillLevels: SkillLevel[] = [];
  loading: boolean = true;
  saving: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private skillService: SkillService,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      hire_date: ['', Validators.required],
      phone: [''],
      gender: [''],
      location: [''],
      notes: [''],
      skills: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    const employeeId = this.route.snapshot.paramMap.get('id');
    if (employeeId) {
      this.loadEmployee(parseInt(employeeId));
      this.loadSkillsData();
    }
  }

  get skillsFormArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.populateForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.errorMessage = 'Erreur lors du chargement du profil employé.';
        this.loading = false;
      }
    });
  }

  loadSkillsData(): void {
    Promise.all([
      this.skillService.getSkills().toPromise(),
      this.skillService.getSkillTypes().toPromise(),
      this.skillService.getSkillLevels().toPromise()
    ]).then(([skills, skillTypes, skillLevels]) => {
      this.skills = skills || [];
      this.skillTypes = skillTypes || [];
      this.skillLevels = skillLevels || [];
    }).catch(err => {
      console.error('Error loading skills data:', err);
    });
  }

  populateForm(): void {
    if (!this.employee) return;

    this.profileForm.patchValue({
      name: this.employee.name,
      position: this.employee.position,
      email: this.employee.email,
      hire_date: this.employee.hire_date,
      phone: this.employee.phone || '',
      gender: this.employee.gender || '',
      location: this.employee.location || '',
      notes: this.employee.notes || ''
    });

    // Populate skills
    const skillsArray = this.profileForm.get('skills') as FormArray;
    skillsArray.clear();
    
    if (this.employee.skills) {
      this.employee.skills.forEach(empSkill => {
        const skillGroup = this.formBuilder.group({
          skill_id: [empSkill.skill_id, Validators.required],
          actual_skill_level_id: [empSkill.actual_skill_level_id, Validators.required],
          acquired_date: [empSkill.acquired_date || ''],
          certification: [empSkill.certification || ''],
          last_evaluated_date: [empSkill.last_evaluated_date || '']
        });
        skillsArray.push(skillGroup);
      });
    }
  }

  addSkill(): void {
    const skillGroup = this.formBuilder.group({
      skill_id: ['', Validators.required],
      actual_skill_level_id: ['', Validators.required],
      acquired_date: [''],
      certification: [''],
      last_evaluated_date: ['']
    });
    this.skillsFormArray.push(skillGroup);
  }

  removeSkill(index: number): void {
    this.skillsFormArray.removeAt(index);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.populateForm(); // Reset form if canceling edit
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.employee) {
      this.saving = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData = this.profileForm.value;
      
      this.employeeService.updateEmployee(this.employee.id!, formData).subscribe({
        next: (updatedEmployee) => {
          this.employee = updatedEmployee;
          this.isEditing = false;
          this.successMessage = 'Profil mis à jour avec succès.';
          this.saving = false;
          this.populateForm();
        },
        error: (err) => {
          console.error('Error updating employee:', err);
          this.errorMessage = 'Erreur lors de la mise à jour du profil.';
          this.saving = false;
        }
      });
    }
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Compétence inconnue';
  }

  getSkillLevelName(levelId: number): string {
    const level = this.skillLevels.find(l => l.id === levelId);
    return level ? level.level_name : 'Niveau inconnu';
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}