import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { JobDescriptionService } from '../../services/job-description.service';
import { EmployeeService } from '../../services/employee.service';
import { MatchingService } from '../../services/matching.service';
import { JobDescription } from '../../models/job-description.model';
import { Employee } from '../../models/employee.model';
import { MatchingResult } from '../../models/matching.model';
import { EmployeeCardComponent } from '../../components/employee-card/employee-card.component';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeCardComponent],
  templateUrl: './matching.component.html',
  styleUrls: ['./matching.component.css']
})
export class MatchingComponent implements OnInit {
  jobDescriptions: JobDescription[] = [];
  employees: Employee[] = [];
  selectedJobId: number | null = null;
  selectedEmployeeId: number | null = null;
  matchingResults: MatchingResult[] = [];
  inverseMatchingResults: MatchingResult[] = [];

  loadingJobDescriptions: boolean = true;
  loadingEmployees: boolean = true;
  loadingMatching: boolean = false;
  loadingInverseMatching: boolean = false;
  loadingAutoAssignment: boolean = false;

  matchingErrorMessage: string | null = null;
  inverseMatchingErrorMessage: string | null = null;
  autoAssignmentMessage: string | null = null;

  // Paramètres d'affectation automatique
  minScoreForAssignment: number = 70;
  maxAssignments: number = 5;

  // Getter pour les candidats éligibles
  get eligibleCandidates(): MatchingResult[] {
    return this.matchingResults.filter(result => result.score >= this.minScoreForAssignment);
  }

  constructor(
    private jobDescriptionService: JobDescriptionService,
    private employeeService: EmployeeService,
    private matchingService: MatchingService
  ) { }

  ngOnInit(): void {
    this.loadJobDescriptions();
    this.loadEmployees();
  }

  loadJobDescriptions(): void {
    this.loadingJobDescriptions = true;
    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (data) => {
        this.jobDescriptions = data;
        this.loadingJobDescriptions = false;
      },
      error: (err) => {
        console.error('Error loading job descriptions:', err);
        this.matchingErrorMessage = 'Erreur lors du chargement des fiches de poste.';
        this.loadingJobDescriptions = false;
      }
    });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loadingEmployees = false;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.inverseMatchingErrorMessage = 'Erreur lors du chargement des employés.';
        this.loadingEmployees = false;
      }
    });
  }

  onJobSelect(): void {
    this.matchingResults = [];
    this.matchingErrorMessage = null;
  }

  onEmployeeSelect(): void {
    this.inverseMatchingResults = [];
    this.inverseMatchingErrorMessage = null;
  }

  performMatching(): void {
    if (!this.selectedJobId) {
      this.matchingErrorMessage = 'Veuillez sélectionner une fiche de poste.';
      return;
    }

    this.loadingMatching = true;
    this.matchingErrorMessage = null;
    this.matchingResults = [];

    // Utilise le nouveau controller jobemployeeskillmatch
    this.matchingService.getJobEmployeeSkillMatch(this.selectedJobId).subscribe({
      next: (results) => {
        this.matchingResults = results.sort((a, b) => b.score - a.score); // Sort by score descending
        this.loadingMatching = false;
      },
      error: (err) => {
        console.error('Error performing matching:', err);
        this.matchingErrorMessage = 'Erreur lors du calcul du matching. Vérifiez que le backend et FastAPI sont en cours d\'exécution.';
        this.loadingMatching = false;
      }
    });
  }

  performInverseMatching(): void {
    if (!this.selectedEmployeeId) {
      this.inverseMatchingErrorMessage = 'Veuillez sélectionner un employé.';
      return;
    }

    this.loadingInverseMatching = true;
    this.inverseMatchingErrorMessage = null;
    this.inverseMatchingResults = [];

    // For inverse matching, we iterate through all job descriptions
    // and call the matching service for each job with the selected employee.
    // This assumes the backend's /jobemployeeskillmatch/:jobId endpoint
    // can handle a single employee's skills being matched against a job.
    // If the backend's /calculate endpoint in FastAPI is used, it would be different.

    // Current backend endpoint only takes jobId and returns all matching employees for that job.
    // To do inverse matching, we need to call the matching for each job and filter results.
    // This might be inefficient for a large number of jobs.
    // A dedicated inverse matching endpoint on the backend would be ideal.

    // For demonstration, we'll simulate by calling matching for all jobs and filtering.
    const promises: Observable<MatchingResult[]>[] = [];
    this.jobDescriptions.forEach(job => {
      if (job.id) {
        promises.push(this.matchingService.getMatchingResults(job.id));
      }
    });

    // Combine all observables and process results
    // This is a simplified approach. A more robust solution would involve a backend endpoint
    // specifically for inverse matching or a more complex client-side aggregation.
    Promise.all(promises.map(p => p.toPromise())).then(allResultsArrays => {
      const allResults: MatchingResult[] = [].concat(...allResultsArrays.filter(r => r !== undefined) as any);
      this.inverseMatchingResults = allResults.filter(result => result.employee_id === this.selectedEmployeeId)
                                              .sort((a, b) => b.score - a.score); // Sort by score descending
      this.loadingInverseMatching = false;
    }).catch(err => {
      console.error('Error performing inverse matching:', err);
      this.inverseMatchingErrorMessage = 'Erreur lors du calcul du matching inverse. Assurez-vous que le service FastAPI est en cours d\'exécution.';
      this.loadingInverseMatching = false;
    });
  }

  // Nouvelle méthode pour l'affectation automatique
  performAutoAssignment(): void {
    if (!this.selectedJobId) {
      this.autoAssignmentMessage = 'Veuillez sélectionner une fiche de poste.';
      return;
    }

    if (this.matchingResults.length === 0) {
      this.autoAssignmentMessage = 'Veuillez d\'abord effectuer un matching.';
      return;
    }

    const eligibleCandidates = this.matchingResults
      .filter(result => result.score >= this.minScoreForAssignment)
      .slice(0, this.maxAssignments);

    if (eligibleCandidates.length === 0) {
      this.autoAssignmentMessage = `Aucun candidat n'atteint le score minimum de ${this.minScoreForAssignment}%.`;
      return;
    }

    const confirmMessage = `Voulez-vous affecter automatiquement ${eligibleCandidates.length} employé(s) à cette fiche de poste ?\n\nCandidats sélectionnés :\n${eligibleCandidates.map(c => `• ${c.name} (${c.score.toFixed(1)}%)`).join('\n')}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.loadingAutoAssignment = true;
    this.autoAssignmentMessage = null;

    // Effectuer les affectations une par une
    const assignmentPromises = eligibleCandidates.map(candidate => {
      return this.employeeService.assignEmployeeToJobDescription(candidate.employee_id, this.selectedJobId!)
        .toPromise()
        .then(() => ({ success: true, candidate }))
        .catch(error => ({ success: false, candidate, error }));
    });

    Promise.all(assignmentPromises).then(results => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      let message = '';
      if (successful.length > 0) {
        message += `✅ ${successful.length} employé(s) affecté(s) avec succès :\n`;
        message += successful.map(r => `• ${r.candidate.name} (${r.candidate.score.toFixed(1)}%)`).join('\n');
      }

      if (failed.length > 0) {
        message += `\n\n❌ ${failed.length} affectation(s) échouée(s) :\n`;
        message += failed.map(r => {
          const failedResult = r as { success: false; candidate: MatchingResult; error: any };
          return `• ${failedResult.candidate.name} : ${failedResult.error?.error?.message || 'Erreur inconnue'}`;
        }).join('\n');
      }

      this.autoAssignmentMessage = message;
      this.loadingAutoAssignment = false;

      // Recharger les employés pour voir les changements
      this.loadEmployees();
    }).catch(error => {
      console.error('Error during auto assignment:', error);
      this.autoAssignmentMessage = '❌ Erreur lors de l\'affectation automatique.';
      this.loadingAutoAssignment = false;
    });
  }

  getEmployeeFromResult(result: MatchingResult): Employee {
    return this.employees.find(emp => emp.id === result.employee_id) || { 
      id: result.employee_id, 
      name: result.name, 
      position: result.position, 
      email: '', 
      hire_date: '' 
    };
  }

  getJobDescriptionFromResult(result: MatchingResult): JobDescription | undefined {
    return this.jobDescriptions.find(job => job.id === result.job_description_id);
  }
}