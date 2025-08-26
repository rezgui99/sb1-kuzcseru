import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JobDescriptionService } from '../../services/job-description.service';
import { SkillService } from '../../services/skill.service';
import { JobDescription } from '../../models/job-description.model';
import { Skill, SkillLevel } from '../../models/employee.model';

@Component({
  selector: 'app-job-descriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './job-descriptions.component.html',
  styleUrls: ['./job-descriptions.component.css']
})
export class JobDescriptionsComponent implements OnInit {
  jobDescriptions: JobDescription[] = [];
  filteredJobDescriptions: JobDescription[] = [];
  jobDescriptionForm: FormGroup;
  showAddForm: boolean = false;
  editingJobDescription: JobDescription | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  searchQuery: string = '';
  selectedFiliere: string = '';
  selectedFamille: string = '';

  // Data for dropdowns
  skills: Skill[] = [];
  skillLevels: SkillLevel[] = [];

  // Filter options
  filiereOptions: string[] = [];
  familleOptions: string[] = [];

  constructor(
    private jobDescriptionService: JobDescriptionService,
    private skillService: SkillService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.jobDescriptionForm = this.formBuilder.group({
      emploi: ['', [Validators.required, Validators.minLength(3)]],
      filiere_activite: ['', Validators.required],
      famille: ['', Validators.required],
      superieur_n1: [''],
      superieur_n2: [''],
      finalite: [''],
      niveau_exigence: [''],
      niveau_exp: [''],
      status: ['Actif'],
      version: ['1.0'],
      missions: this.formBuilder.array([]),
      moyens: this.formBuilder.array([]),
      airesProximites: this.formBuilder.array([]),
      requiredSkills: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.loadJobDescriptions();
    this.loadSkillsData();
  }

  // FormArray getters
  get missionsArray(): FormArray {
    return this.jobDescriptionForm.get('missions') as FormArray;
  }

  get moyensArray(): FormArray {
    return this.jobDescriptionForm.get('moyens') as FormArray;
  }

  get airesProximiteArray(): FormArray {
    return this.jobDescriptionForm.get('airesProximites') as FormArray;
  }

  get requiredSkillsArray(): FormArray {
    return this.jobDescriptionForm.get('requiredSkills') as FormArray;
  }

  loadJobDescriptions(): void {
    this.loading = true;
    this.errorMessage = null;
    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (jobDescriptions) => {
        this.jobDescriptions = jobDescriptions;
        this.filteredJobDescriptions = [...jobDescriptions];
        this.extractFilterOptions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading job descriptions:', err);
        this.errorMessage = 'Erreur lors du chargement des fiches de poste.';
        this.loading = false;
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

  extractFilterOptions(): void {
    const filieres = new Set<string>();
    const familles = new Set<string>();

    this.jobDescriptions.forEach(job => {
      if (job.filiere_activite) filieres.add(job.filiere_activite);
      if (job.famille) familles.add(job.famille);
    });

    this.filiereOptions = Array.from(filieres).sort();
    this.familleOptions = Array.from(familles).sort();
  }

  // Mission methods
  addMission(): void {
    const missionGroup = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.missionsArray.push(missionGroup);
  }

  removeMission(index: number): void {
    this.missionsArray.removeAt(index);
  }

  // Moyen methods
  addMoyen(): void {
    const moyenGroup = this.formBuilder.group({
      name: ['', Validators.required]
    });
    this.moyensArray.push(moyenGroup);
  }

  removeMoyen(index: number): void {
    this.moyensArray.removeAt(index);
  }

  // Aire de proximité methods
  addAireProximite(): void {
    const aireGroup = this.formBuilder.group({
      name: ['', Validators.required],
      nombre: [1, [Validators.required, Validators.min(1)]]
    });
    this.airesProximiteArray.push(aireGroup);
  }

  removeAireProximite(index: number): void {
    this.airesProximiteArray.removeAt(index);
  }

  // Required skills methods
  addRequiredSkill(): void {
    const skillGroup = this.formBuilder.group({
      skill_id: ['', Validators.required],
      required_skill_level_id: ['', Validators.required]
    });
    this.requiredSkillsArray.push(skillGroup);
  }

  removeRequiredSkill(index: number): void {
    this.requiredSkillsArray.removeAt(index);
  }

  getSuperieurName(superieurId: number): string {
    const superieur = this.jobDescriptions.find(job => job.id === superieurId);
    return superieur ? `${superieur.emploi}` : `ID: ${superieurId}`;
  }

  applyFilters(): void {
    this.filteredJobDescriptions = this.jobDescriptions.filter(job => {
      const matchesSearch = !this.searchQuery || 
        job.emploi.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.filiere_activite.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.famille.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesFiliere = !this.selectedFiliere || job.filiere_activite === this.selectedFiliere;
      const matchesFamille = !this.selectedFamille || job.famille === this.selectedFamille;

      return matchesSearch && matchesFiliere && matchesFamille;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedFiliere = '';
    this.selectedFamille = '';
    this.filteredJobDescriptions = [...this.jobDescriptions];
  }

  onSubmit(): void {
    if (this.jobDescriptionForm.valid) {
      const formValue = this.jobDescriptionForm.value;
      
      // Préparer les données exactement comme dans votre JSON
      const jobDescriptionData: Partial<JobDescription> = {
        emploi: formValue.emploi?.trim() || '',
        filiere_activite: formValue.filiere_activite?.trim() || '',
        famille: formValue.famille?.trim() || '',
        superieur_n1: this.parseIntegerField(formValue.superieur_n1),
        superieur_n2: this.parseIntegerField(formValue.superieur_n2),
        finalite: formValue.finalite?.trim() || '',
        niveau_exigence: formValue.niveau_exigence || '',
        niveau_exp: formValue.niveau_exp || '',
        status: formValue.status || 'Actif',
        version: formValue.version || '1.0',
        missions: formValue.missions || [],
        moyens: formValue.moyens || [],
        airesProximites: formValue.airesProximites || [],
        requiredSkills: formValue.requiredSkills.map((skill: any) => ({
          skill_id: parseInt(skill.skill_id, 10),
          required_skill_level_id: parseInt(skill.required_skill_level_id, 10)
        })) || []
      };

      console.log('Données à envoyer:', JSON.stringify(jobDescriptionData, null, 2));
      
      if (this.editingJobDescription) {
        this.jobDescriptionService.updateJobDescription(this.editingJobDescription.id!, jobDescriptionData).subscribe({
          next: (updatedJobDescription) => {
            const index = this.jobDescriptions.findIndex(job => job.id === updatedJobDescription.id);
            if (index !== -1) {
              this.jobDescriptions[index] = updatedJobDescription;
            }
            this.applyFilters();
            this.cancelEdit();
            this.errorMessage = null;
          },
          error: (err) => {
            console.error('Error updating job description:', err);
            this.errorMessage = `Erreur lors de la mise à jour: ${err.error?.message || err.message}`;
          }
        });
      } else {
        this.jobDescriptionService.createJobDescription(jobDescriptionData).subscribe({
          next: (newJobDescription) => {
            this.jobDescriptions.push(newJobDescription);
            this.applyFilters();
            this.extractFilterOptions();
            this.cancelEdit();
            this.errorMessage = null;
          },
          error: (err) => {
            console.error('Error creating job description:', err);
            this.errorMessage = `Erreur lors de la création: ${err.error?.message || err.message}`;
          }
        });
      }
    }
  }

  private parseIntegerField(value: any): number | null {
    if (!value || value === '' || value === 'null' || value === 'undefined') {
      return null;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  editJobDescription(jobDescription: JobDescription): void {
    this.editingJobDescription = jobDescription;
    this.showAddForm = false;
    
    // Remplir le formulaire avec les données existantes
    this.jobDescriptionForm.patchValue({
      emploi: jobDescription.emploi,
      filiere_activite: jobDescription.filiere_activite,
      famille: jobDescription.famille,
      superieur_n1: jobDescription.superieur_n1 || '',
      superieur_n2: jobDescription.superieur_n2 || '',
      finalite: jobDescription.finalite || '',
      niveau_exigence: jobDescription.niveau_exigence || '',
      niveau_exp: jobDescription.niveau_exp || '',
      status: jobDescription.status || 'Actif',
      version: jobDescription.version || '1.0'
    });

    // Remplir les arrays
    this.populateFormArrays(jobDescription);
  }

  private populateFormArrays(jobDescription: JobDescription): void {
    // Clear existing arrays
    while (this.missionsArray.length !== 0) {
      this.missionsArray.removeAt(0);
    }
    while (this.moyensArray.length !== 0) {
      this.moyensArray.removeAt(0);
    }
    while (this.airesProximiteArray.length !== 0) {
      this.airesProximiteArray.removeAt(0);
    }
    while (this.requiredSkillsArray.length !== 0) {
      this.requiredSkillsArray.removeAt(0);
    }

    // Populate missions
    if (jobDescription.missions) {
      jobDescription.missions.forEach(mission => {
        const missionGroup = this.formBuilder.group({
          name: [mission.mission || '', Validators.required]
        });
        this.missionsArray.push(missionGroup);
      });
    }

    // Populate moyens
    if (jobDescription.moyens) {
      jobDescription.moyens.forEach(moyen => {
        const moyenGroup = this.formBuilder.group({
          name: [moyen.moyen || '', Validators.required]
        });
        this.moyensArray.push(moyenGroup);
      });
    }

    // Populate aires de proximité
    if (jobDescription.airesProximites) {
      jobDescription.airesProximites.forEach(aire => {
        const aireGroup = this.formBuilder.group({
          name: [aire.poste || '', Validators.required],
          nombre: [aire.nombre || 1, [Validators.required, Validators.min(1)]]
        });
        this.airesProximiteArray.push(aireGroup);
      });
    }

    // Populate required skills
    if (jobDescription.requiredSkills) {
      jobDescription.requiredSkills.forEach(skill => {
        const skillGroup = this.formBuilder.group({
          skill_id: [skill.skill_id || '', Validators.required],
          required_skill_level_id: [skill.required_skill_level_id || '', Validators.required]
        });
        this.requiredSkillsArray.push(skillGroup);
      });
    }
  }

  deleteJobDescription(jobDescription: JobDescription): void {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la fiche "${jobDescription.emploi}" ?`)) {
      this.jobDescriptionService.deleteJobDescription(jobDescription.id!).subscribe({
        next: () => {
          this.jobDescriptions = this.jobDescriptions.filter(job => job.id !== jobDescription.id);
          this.applyFilters();
          this.extractFilterOptions();
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Error deleting job description:', err);
          this.errorMessage = 'Erreur lors de la suppression de la fiche de poste.';
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingJobDescription = null;
    this.showAddForm = false;
    this.jobDescriptionForm.reset({
      superieur_n1: '',
      superieur_n2: '',
      status: 'Actif',
      version: '1.0'
    });
    
    // Clear all form arrays
    while (this.missionsArray.length !== 0) {
      this.missionsArray.removeAt(0);
    }
    while (this.moyensArray.length !== 0) {
      this.moyensArray.removeAt(0);
    }
    while (this.airesProximiteArray.length !== 0) {
      this.airesProximiteArray.removeAt(0);
    }
    while (this.requiredSkillsArray.length !== 0) {
      this.requiredSkillsArray.removeAt(0);
    }
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.id === skillId);
    return skill ? skill.name : `Skill ${skillId}`;
  }

  getSkillLevelName(levelId: number): string {
    const level = this.skillLevels.find(l => l.id === levelId);
    return level ? level.level_name : `Level ${levelId}`;
  }

  navigateToMatching(jobId: number): void {
    this.router.navigate(['/matching'], { queryParams: { jobId: jobId } });
  }
}