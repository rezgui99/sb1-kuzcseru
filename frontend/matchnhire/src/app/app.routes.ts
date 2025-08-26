import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { MatchingComponent } from './pages/matching/matching.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { CvLibraryComponent } from './pages/cv-library/cv-library.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { JobDescriptionsComponent } from './pages/job-descriptions/job-descriptions.component';
import { SkillsManagementComponent } from './pages/skills-management/skills-management.component';
import { OrganigrammeComponent } from './pages/organigramme/organigramme.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'job-descriptions', component: JobDescriptionsComponent },
  { path: 'matching', component: MatchingComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'cv-library', component: CvLibraryComponent },
  { path: 'skills-management', component: SkillsManagementComponent },
  { path: 'organigramme', component: OrganigrammeComponent },
  { path: '**', redirectTo: '/home' }
];