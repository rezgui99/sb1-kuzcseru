import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { SkillService } from '../../services/skill.service';
import { JobDescriptionService } from '../../services/job-description.service';
import { MatchingService } from '../../services/matching.service';
import { Employee, Skill, SkillLevel } from '../../models/employee.model';
import { JobDescription } from '../../models/job-description.model';
import { MatchingResult } from '../../models/matching.model';
import { EmployeeSkillComponent } from '../../components/employee-skill/employee-skill.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, EmployeeSkillComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  employeeSkills: any[] = [];
  employeeForm: FormGroup;
  jobDescriptions: JobDescription[] = [];
  skills: Skill[] = [];
  skillLevels: SkillLevel[] = [];
  showAddForm: boolean = false;
  editingEmployee: Employee | null = null;
  showAssignJobForm: boolean = false;
  assigningEmployee: Employee | null = null;
  selectedJobId: number | null = null;
  loading: boolean = false;
  loadingSkills: boolean = false;
  loadingJobs: boolean = false;
  errorMessage: string | null = null;
  
  // Nouvelles propriétés pour l'affectation automatique
  showAutoAssignModal: boolean = false;
  autoAssigningEmployee: Employee | null = null;
  bestJobMatches: MatchingResult[] = [];
  loadingBestMatches: boolean = false;
  autoAssignMessage: string | null = null;
  viewMode: 'list' | 'skills' = 'list';

  constructor(
    private employeeService: EmployeeService,
    private skillService: SkillService,
    private jobDescriptionService: JobDescriptionService,
    private matchingService: MatchingService,
    private formBuilder: FormBuilder
  ) {
    this.employeeForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      position: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      hire_date: ['', Validators.required],
      phone: [''],
      gender: [''],
      location: [''],
      notes: [''],
      job_description_id: [''],
      skills: this.formBuilder.array([]) // FormArray pour les compétences
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadEmployeeSkills();
    this.loadSkillsData();
    this.loadJobDescriptions();
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
        console.error('Error loading employees:', err);
        this.errorMessage = 'Erreur lors du chargement des employés. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  loadEmployeeSkills(): void {
    this.loadingSkills = true;
    this.skillService.getEmployeeSkills().subscribe({
      next: (employeeSkills) => {
        this.employeeSkills = employeeSkills;
        this.loadingSkills = false;
      },
      error: (err) => {
        console.error('Error loading employee skills:', err);
        this.loadingSkills = false;
      }
    });
  }

  loadSkillsData(): void {
    Promise.all([
      this.skillService.getSkills().toPromise(),
      this.skillService.getSkillLevels().toPromise()
    ]).then(([skills, skillLevels]) => {
      this.skills = skills || [];
      this.skillLevels = skillLevels || [];
    }).catch(err => {
      console.error('Error loading skills data:', err);
    });
  }

  loadJobDescriptions(): void {
    this.loadingJobs = true;
    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (jobDescriptions) => {
        this.jobDescriptions = jobDescriptions;
        this.loadingJobs = false;
      },
      error: (err) => {
        console.error('Error loading job descriptions:', err);
        this.loadingJobs = false;
      }
    });
  }

  get skillsFormArray(): FormArray {
    return this.employeeForm.get('skills') as FormArray;
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
  switchView(mode: 'list' | 'skills'): void {
    this.viewMode = mode;
    if (mode === 'skills' && this.employeeSkills.length === 0) {
      this.loadEmployeeSkills();
    }
  }

  getEmployeeSkills(employeeId: number): any[] {
    return this.employeeSkills.filter(skill => skill.employee_id === employeeId);
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : `Employee ${employeeId}`;
  }
  onSubmit(): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      
      const employeeData = {
        name: formValue.name,
        position: formValue.position,
        email: formValue.email,
        hire_date: formValue.hire_date,
        phone: formValue.phone || '',
        gender: formValue.gender || '',
        location: formValue.location || '',
        notes: formValue.notes || '',
        job_description_id: this.parseIntegerField(formValue.job_description_id) || undefined,
        skills: formValue.skills
          .filter((skill: any) => skill.skill_id && skill.actual_skill_level_id)
          .map((skill: any) => ({
            skill_id: parseInt(skill.skill_id, 10),
            actual_skill_level_id: parseInt(skill.actual_skill_level_id, 10),
            acquired_date: skill.acquired_date || null,
            certification: skill.certification || null,
            last_evaluated_date: skill.last_evaluated_date || null
          }))
      } as Employee;
      
      console.log('Données employé à envoyer:', employeeData);
      
      if (this.editingEmployee) {
        this.employeeService.updateEmployee(this.editingEmployee.id!, employeeData).subscribe({
          next: (updatedEmployee) => {
            const index = this.employees.findIndex(emp => emp.id === updatedEmployee.id);
            if (index !== -1) {
              this.employees[index] = updatedEmployee;
            }
            this.loadEmployeeSkills(); // Recharger les compétences
            this.cancelEdit();
            this.errorMessage = null;
            console.log('✅ Employé mis à jour avec succès');
          },
          error: (err) => {
            console.error('Error updating employee:', err);
            this.errorMessage = `❌ Erreur mise à jour: ${err.error?.message || err.message}`;
          }
        });
      } else {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: (newEmployee) => {
            this.employees.push(newEmployee);
            this.loadEmployeeSkills(); // Recharger les compétences
            this.cancelEdit();
            this.errorMessage = null;
            console.log('✅ Employé créé avec succès');
          },
          error: (err) => {
            console.error('Error creating employee:', err);
            this.errorMessage = `❌ Erreur création: ${err.error?.message || err.message}`;
          }
        });
      }
    } else {
      console.log('❌ Formulaire invalide:', this.employeeForm.errors);
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
    }
  }

  editEmployee(employee: Employee): void {
    this.editingEmployee = employee;
    this.showAddForm = false;
    
    // Remplir les champs de base
    this.employeeForm.patchValue({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      hire_date: employee.hire_date,
      phone: employee.phone || '',
      gender: employee.gender || '',
      location: employee.location || '',
      notes: employee.notes || '',
      job_description_id: employee.job_description_id || ''
    });

    // Vider et remplir les compétences
    while (this.skillsFormArray.length !== 0) {
      this.skillsFormArray.removeAt(0);
    }
    
    if (employee.skills && employee.skills.length > 0) {
      employee.skills.forEach(empSkill => {
        const skillGroup = this.formBuilder.group({
          skill_id: [empSkill.skill_id || '', Validators.required],
          actual_skill_level_id: [empSkill.actual_skill_level_id || '', Validators.required],
          acquired_date: [empSkill.acquired_date || ''],
          certification: [empSkill.certification || ''],
          last_evaluated_date: [empSkill.last_evaluated_date || '']
        });
        this.skillsFormArray.push(skillGroup);
      });
    }
  }

  deleteEmployee(employee: Employee): void {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.name} ?`)) {
      this.employeeService.deleteEmployee(employee.id!).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== employee.id);
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Error deleting employee:', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'employé.';
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingEmployee = null;
    this.showAddForm = false;
    this.employeeForm.reset();
    
    // Vider le FormArray des compétences
    while (this.skillsFormArray.length !== 0) {
      this.skillsFormArray.removeAt(0);
    }
    
    this.errorMessage = null;
  }

  // Affectation à une fiche de poste
  showAssignJob(employee: Employee): void {
    this.assigningEmployee = employee;
    this.selectedJobId = employee.job_description_id || null;
    this.showAssignJobForm = true;
    this.errorMessage = null;
  }

  assignToJob(): void {
    if (!this.assigningEmployee || this.selectedJobId === null) {
      this.errorMessage = 'Veuillez sélectionner une fiche de poste.';
      return;
    }

    // Utiliser le controller jobdescriptionemployee pour l'affectation
    this.employeeService.assignEmployeeToJobDescription(this.assigningEmployee.id!, this.selectedJobId).subscribe({
      next: (updatedEmployee) => {
        // Mettre à jour l'employé localement
        const index = this.employees.findIndex(emp => emp.id === this.assigningEmployee!.id);
        if (index !== -1) {
          this.employees[index].job_description_id = this.selectedJobId;
        }
        this.cancelAssignJob();
        this.errorMessage = null;
        console.log('✅ Employé affecté avec succès');
      },
      error: (err) => {
        console.error('Error assigning employee to job:', err);
        this.errorMessage = `❌ Erreur affectation: ${err.error?.message || err.message}`;
      }
    });
  }

  cancelAssignJob(): void {
    this.assigningEmployee = null;
    this.selectedJobId = null;
    this.showAssignJobForm = false;
    this.errorMessage = null;
  }

  // Nouvelle méthode pour désaffecter un employé
  unassignFromJob(employee: Employee): void {
    if (!employee.job_description_id) {
      this.errorMessage = 'Cet employé n\'est pas affecté à une fiche de poste.';
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir désaffecter ${employee.name} de sa fiche de poste ?`)) {
      this.employeeService.unassignEmployeeFromJobDescription(employee.id!, employee.job_description_id).subscribe({
        next: () => {
          const index = this.employees.findIndex(emp => emp.id === employee.id);
          if (index !== -1) {
            this.employees[index].job_description_id = null;
          }
          this.errorMessage = null;
          console.log('✅ Employé désaffecté avec succès');
        },
        error: (err) => {
          console.error('Error unassigning employee from job:', err);
          this.errorMessage = `❌ Erreur désaffectation: ${err.error?.message || err.message}`;
        }
      });
    }
  }

  // Méthode pour voir tous les employés d'une fiche de poste
  viewEmployeesOfJob(jobId: number): void {
    this.employeeService.getEmployeesByJobDescription(jobId).subscribe({
      next: (employees) => {
        console.log('Employés de cette fiche de poste:', employees);
        // Vous pouvez afficher ces données dans un modal ou une nouvelle vue
      },
      error: (err) => {
        console.error('Error loading employees of job:', err);
        this.errorMessage = 'Erreur lors du chargement des employés de cette fiche de poste.';
      }
    });
  }

  // Méthode pour voir toutes les fiches d'un employé
  viewJobsOfEmployee(employeeId: number): void {
    this.employeeService.getJobDescriptionsByEmployee(employeeId).subscribe({
      next: (jobs) => {
        console.log('Fiches de poste de cet employé:', jobs);
        // Vous pouvez afficher ces données dans un modal ou une nouvelle vue
      },
      error: (err) => {
        console.error('Error loading jobs of employee:', err);
        this.errorMessage = 'Erreur lors du chargement des fiches de cet employé.';
      }
    });
  }

  private parseIntegerField(value: any): number | null {
    if (!value || value === '' || value === 'null' || value === 'undefined') {
      return null;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  editSkill(skill: any): void {
    // TODO: Implémenter l'édition de compétence
    console.log('Edit skill:', skill);
  }

  deleteSkill(skill: any): void {
    this.skillService.deleteEmployeeSkill(skill.employee_id, skill.skill_id).subscribe({
      next: () => {
        this.loadEmployeeSkills();
        // Optionnel: afficher un message de succès
      },
      error: (err) => {
        console.error('Error deleting skill:', err);
        this.errorMessage = 'Erreur lors de la suppression de la compétence.';
      }
    });
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Compétence inconnue';
  }

  getSkillLevelName(levelId: number): string {
    const level = this.skillLevels.find(l => l.id === levelId);
    return level ? level.level_name : 'Niveau inconnu';
  }

  getJobDescriptionName(jobId: number): string {
    const job = this.jobDescriptions.find(j => j.id === jobId);
    return job ? `${job.emploi} - ${job.filiere_activite}` : 'Fiche inconnue';
  }

  // Nouvelle méthode pour trouver le meilleur poste pour un employé
  findBestJobForEmployee(employee: Employee): void {
    this.autoAssigningEmployee = employee;
    this.showAutoAssignModal = true;
    this.loadingBestMatches = true;
    this.autoAssignMessage = null;
    this.bestJobMatches = [];

    // Utiliser la méthode alternative car le backend n'a probablement pas l'endpoint spécifique
    this.matchingService.findBestJobForEmployeeAlternative(employee.id!, this.jobDescriptions)
      .subscribe({
        next: (matches) => {
          this.bestJobMatches = matches.slice(0, 5); // Top 5 des meilleurs matches
          this.loadingBestMatches = false;
          
          if (this.bestJobMatches.length === 0) {
            this.autoAssignMessage = 'Aucun poste compatible trouvé pour cet employé.';
          }
        },
        error: (err) => {
          console.error('Error finding best job matches:', err);
          this.autoAssignMessage = 'Erreur lors de la recherche des postes compatibles.';
          this.loadingBestMatches = false;
        }
      });
  }

  // Affecter l'employé au poste sélectionné
  assignToBestJob(jobId: number, score: number): void {
    if (!this.autoAssigningEmployee) return;

    const confirmMessage = `Voulez-vous affecter ${this.autoAssigningEmployee.name} à ce poste ?\n\nScore de compatibilité : ${score.toFixed(1)}%`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.employeeService.assignEmployeeToJobDescription(this.autoAssigningEmployee.id!, jobId)
      .subscribe({
        next: () => {
          // Mettre à jour l'employé localement
          const index = this.employees.findIndex(emp => emp.id === this.autoAssigningEmployee!.id);
          if (index !== -1) {
            this.employees[index].job_description_id = jobId;
          }
          
          this.autoAssignMessage = `✅ ${this.autoAssigningEmployee!.name} a été affecté(e) avec succès !`;
          this.bestJobMatches = [];
          
          // Fermer le modal après 2 secondes
          setTimeout(() => {
            this.closeAutoAssignModal();
          }, 2000);
        },
        error: (err) => {
          console.error('Error assigning employee:', err);
          this.autoAssignMessage = `❌ Erreur lors de l'affectation : ${err.error?.message || err.message}`;
        }
      });
  }

  // Fermer le modal d'affectation automatique
  closeAutoAssignModal(): void {
    this.showAutoAssignModal = false;
    this.autoAssigningEmployee = null;
    this.bestJobMatches = [];
    this.autoAssignMessage = null;
    this.loadingBestMatches = false;
  }

  // Obtenir le nom du poste à partir de l'ID
  getJobNameFromId(jobId: number): string {
    const job = this.jobDescriptions.find(j => j.id === jobId);
    return job ? job.emploi : 'Poste inconnu';
  }

  // Obtenir la filière du poste à partir de l'ID
  getJobFiliereFromId(jobId: number): string {
    const job = this.jobDescriptions.find(j => j.id === jobId);
    return job ? job.filiere_activite : 'Filière inconnue';
  }
}