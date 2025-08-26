import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Skill, SkillType, SkillLevel } from '../../models/employee.model';

@Component({
  selector: 'app-skills-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './skills-management.component.html',
  styleUrls: ['./skills-management.component.css']
})
export class SkillsManagementComponent implements OnInit {
  activeTab: 'skills' | 'types' | 'levels' = 'skills';
  
  // Skills
  skills: Skill[] = [];
  skillForm: FormGroup;
  showSkillForm: boolean = false;
  editingSkill: Skill | null = null;
  
  // Skill Types
  skillTypes: SkillType[] = [];
  skillTypeForm: FormGroup;
  showSkillTypeForm: boolean = false;
  editingSkillType: SkillType | null = null;
  
  // Skill Levels
  skillLevels: SkillLevel[] = [];
  skillLevelForm: FormGroup;
  showSkillLevelForm: boolean = false;
  editingSkillLevel: SkillLevel | null = null;
  
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private apiUrl = environment.backendUrl;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.skillForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      skill_type_id: ['', Validators.required]
    });

    this.skillTypeForm = this.formBuilder.group({
      type_name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.skillLevelForm = this.formBuilder.group({
      level_name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      value: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.errorMessage = null;
    
    Promise.all([
      this.loadSkills(),
      this.loadSkillTypes(),
      this.loadSkillLevels()
    ]).then(() => {
      this.loading = false;
    }).catch(err => {
      console.error('Error loading data:', err);
      this.errorMessage = 'Erreur lors du chargement des données.';
      this.loading = false;
    });
  }

  // Skills API calls
  loadSkills(): Promise<void> {
    return this.http.get<Skill[]>(`${this.apiUrl}/skills`).toPromise()
      .then(skills => {
        this.skills = skills || [];
      });
  }

  loadSkillTypes(): Promise<void> {
    return this.http.get<SkillType[]>(`${this.apiUrl}/skilltypes`).toPromise()
      .then(skillTypes => {
        this.skillTypes = skillTypes || [];
      });
  }

  loadSkillLevels(): Promise<void> {
    return this.http.get<SkillLevel[]>(`${this.apiUrl}/skilllevels`).toPromise()
      .then(skillLevels => {
        this.skillLevels = skillLevels || [];
      });
  }

  setActiveTab(tab: 'skills' | 'types' | 'levels'): void {
    this.activeTab = tab;
    this.cancelAllForms();
  }

  cancelAllForms(): void {
    this.showSkillForm = false;
    this.showSkillTypeForm = false;
    this.showSkillLevelForm = false;
    this.editingSkill = null;
    this.editingSkillType = null;
    this.editingSkillLevel = null;
    this.skillForm.reset();
    this.skillTypeForm.reset();
    this.skillLevelForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  // Skills Management
  showAddSkillForm(): void {
    this.showSkillForm = true;
    this.editingSkill = null;
    this.skillForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  editSkill(skill: Skill): void {
    this.editingSkill = skill;
    this.showSkillForm = true;
    this.skillForm.patchValue({
      name: skill.name,
      description: skill.description || '',
      skill_type_id: skill.skill_type_id || ''
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSkillSubmit(): void {
    if (this.skillForm.valid) {
      const skillData = this.skillForm.value;
      
      if (this.editingSkill) {
        // Update existing skill
        this.http.put<Skill>(`${this.apiUrl}/skills/${this.editingSkill.id}`, skillData)
          .subscribe({
            next: (updatedSkill) => {
              const index = this.skills.findIndex(s => s.id === updatedSkill.id);
              if (index !== -1) {
                this.skills[index] = updatedSkill;
              }
              this.successMessage = 'Compétence mise à jour avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error updating skill:', err);
              this.errorMessage = 'Erreur lors de la mise à jour de la compétence.';
            }
          });
      } else {
        // Create new skill
        this.http.post<Skill>(`${this.apiUrl}/skills`, skillData)
          .subscribe({
            next: (newSkill) => {
              this.skills.push(newSkill);
              this.successMessage = 'Compétence créée avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error creating skill:', err);
              this.errorMessage = 'Erreur lors de la création de la compétence.';
            }
          });
      }
    }
  }

  deleteSkill(skill: Skill): void {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la compétence "${skill.name}" ?`)) {
      this.http.delete(`${this.apiUrl}/skills/${skill.id}`)
        .subscribe({
          next: () => {
            this.skills = this.skills.filter(s => s.id !== skill.id);
            this.successMessage = 'Compétence supprimée avec succès.';
          },
          error: (err) => {
            console.error('Error deleting skill:', err);
            this.errorMessage = 'Erreur lors de la suppression de la compétence.';
          }
        });
    }
  }

  // Skill Types Management
  showAddSkillTypeForm(): void {
    this.showSkillTypeForm = true;
    this.editingSkillType = null;
    this.skillTypeForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  editSkillType(skillType: SkillType): void {
    this.editingSkillType = skillType;
    this.showSkillTypeForm = true;
    this.skillTypeForm.patchValue({
      type_name: skillType.type_name,
      description: skillType.description || ''
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSkillTypeSubmit(): void {
    if (this.skillTypeForm.valid) {
      const skillTypeData = this.skillTypeForm.value;
      
      if (this.editingSkillType) {
        // Update existing skill type
        this.http.put<SkillType>(`${this.apiUrl}/skilltypes/${this.editingSkillType.id}`, skillTypeData)
          .subscribe({
            next: (updatedSkillType) => {
              const index = this.skillTypes.findIndex(st => st.id === updatedSkillType.id);
              if (index !== -1) {
                this.skillTypes[index] = updatedSkillType;
              }
              this.successMessage = 'Type de compétence mis à jour avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error updating skill type:', err);
              this.errorMessage = 'Erreur lors de la mise à jour du type de compétence.';
            }
          });
      } else {
        // Create new skill type
        this.http.post<SkillType>(`${this.apiUrl}/skilltypes`, skillTypeData)
          .subscribe({
            next: (newSkillType) => {
              this.skillTypes.push(newSkillType);
              this.successMessage = 'Type de compétence créé avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error creating skill type:', err);
              this.errorMessage = 'Erreur lors de la création du type de compétence.';
            }
          });
      }
    }
  }

  deleteSkillType(skillType: SkillType): void {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le type "${skillType.type_name}" ?`)) {
      this.http.delete(`${this.apiUrl}/skilltypes/${skillType.id}`)
        .subscribe({
          next: () => {
            this.skillTypes = this.skillTypes.filter(st => st.id !== skillType.id);
            this.successMessage = 'Type de compétence supprimé avec succès.';
          },
          error: (err) => {
            console.error('Error deleting skill type:', err);
            this.errorMessage = 'Erreur lors de la suppression du type de compétence.';
          }
        });
    }
  }

  // Skill Levels Management
  showAddSkillLevelForm(): void {
    this.showSkillLevelForm = true;
    this.editingSkillLevel = null;
    this.skillLevelForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  editSkillLevel(skillLevel: SkillLevel): void {
    this.editingSkillLevel = skillLevel;
    this.showSkillLevelForm = true;
    this.skillLevelForm.patchValue({
      level_name: skillLevel.level_name,
      description: skillLevel.description || '',
      value: skillLevel.value
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSkillLevelSubmit(): void {
    if (this.skillLevelForm.valid) {
      const skillLevelData = this.skillLevelForm.value;
      
      if (this.editingSkillLevel) {
        // Update existing skill level
        this.http.put<SkillLevel>(`${this.apiUrl}/skilllevels/${this.editingSkillLevel.id}`, skillLevelData)
          .subscribe({
            next: (updatedSkillLevel) => {
              const index = this.skillLevels.findIndex(sl => sl.id === updatedSkillLevel.id);
              if (index !== -1) {
                this.skillLevels[index] = updatedSkillLevel;
              }
              this.successMessage = 'Niveau de compétence mis à jour avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error updating skill level:', err);
              this.errorMessage = 'Erreur lors de la mise à jour du niveau de compétence.';
            }
          });
      } else {
        // Create new skill level
        this.http.post<SkillLevel>(`${this.apiUrl}/skilllevels`, skillLevelData)
          .subscribe({
            next: (newSkillLevel) => {
              this.skillLevels.push(newSkillLevel);
              this.successMessage = 'Niveau de compétence créé avec succès.';
              this.cancelAllForms();
            },
            error: (err) => {
              console.error('Error creating skill level:', err);
              this.errorMessage = 'Erreur lors de la création du niveau de compétence.';
            }
          });
      }
    }
  }

  deleteSkillLevel(skillLevel: SkillLevel): void {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le niveau "${skillLevel.level_name}" ?`)) {
      this.http.delete(`${this.apiUrl}/skilllevels/${skillLevel.id}`)
        .subscribe({
          next: () => {
            this.skillLevels = this.skillLevels.filter(sl => sl.id !== skillLevel.id);
            this.successMessage = 'Niveau de compétence supprimé avec succès.';
          },
          error: (err) => {
            console.error('Error deleting skill level:', err);
            this.errorMessage = 'Erreur lors de la suppression du niveau de compétence.';
          }
        });
    }
  }

  getSkillTypeName(skillTypeId: number): string {
    const skillType = this.skillTypes.find(st => st.id === skillTypeId);
    return skillType ? skillType.type_name : 'Type inconnu';
  }

  // Utility method to clear messages after a delay
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 5000);
  }
}