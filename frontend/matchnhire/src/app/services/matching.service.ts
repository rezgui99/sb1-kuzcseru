import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatchingResult, MatchingAnalytics } from '../models/matching.model';
import { environment } from '../../environments/environment';
import { EmployeeService } from './employee.service';

@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private apiUrl = `${environment.backendUrl}/jobemployeeskillmatch`;

  constructor(
    private http: HttpClient,
    private employeeService: EmployeeService
  ) { }

  // Utilise le nouveau controller jobemployeeskillmatch
  getJobEmployeeSkillMatch(jobId: number): Observable<MatchingResult[]> {
    return this.http.get<MatchingResult[]>(`${this.apiUrl}/${jobId}`);
  }

  // Méthode legacy pour compatibilité
  getMatchingResults(jobId: number): Observable<MatchingResult[]> {
    return this.getJobEmployeeSkillMatch(jobId);
  }

  // Affectation automatique basée sur le score
  autoAssignEmployeesToJob(jobId: number, minScore: number = 70, maxAssignments: number = 5): Observable<any> {
    return this.getJobEmployeeSkillMatch(jobId).pipe(
      map(results => {
        // Filtrer par score minimum et trier par score décroissant
        const eligibleEmployees = results
          .filter(result => result.score >= minScore)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxAssignments); // Limiter le nombre d'affectations

        return eligibleEmployees;
      }),
      // Effectuer les affectations
      map(eligibleEmployees => {
        const assignmentPromises = eligibleEmployees.map(result => 
          this.employeeService.assignEmployeeToJobDescription(result.employee_id, jobId).toPromise()
        );

        return {
          eligibleEmployees,
          assignmentPromises: Promise.all(assignmentPromises)
        };
      })
    );
  }
  getMatchingAnalytics(jobId: number): Observable<MatchingAnalytics> {
    return this.http.get<MatchingAnalytics>(`${this.apiUrl}/${jobId}/analytics`);
  }

  exportMatchingResults(jobId: number, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${jobId}/export?format=${format}`, {
      responseType: 'blob'
    });
  }

  // Nouvelle méthode pour trouver le meilleur poste pour un employé
  findBestJobForEmployee(employeeId: number): Observable<MatchingResult[]> {
    // On va tester l'employé contre tous les postes disponibles
    return this.http.get<MatchingResult[]>(`${this.apiUrl}/employee/${employeeId}/best-matches`);
  }

  // Méthode alternative si le backend n'a pas l'endpoint spécifique
  findBestJobForEmployeeAlternative(employeeId: number, jobDescriptions: any[]): Observable<MatchingResult[]> {
    // On teste l'employé contre chaque poste et on retourne les résultats triés
    const matchingPromises = jobDescriptions.map(job => 
      this.getJobEmployeeSkillMatch(job.id).toPromise()
        .then(results => results.filter(result => result.employee_id === employeeId))
        .catch(() => [])
    );

    return new Observable(observer => {
      Promise.all(matchingPromises).then(allResults => {
        const flatResults = allResults.flat().sort((a, b) => b.score - a.score);
        observer.next(flatResults);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}