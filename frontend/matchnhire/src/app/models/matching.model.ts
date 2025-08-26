export interface MatchingRequest {
  job_description: JobDescriptionForMatching;
  employees: EmployeeForMatching[];
}

export interface JobDescriptionForMatching {
  job_description_id: number;
  required_skills_level: RequiredSkillLevel[];
}

export interface RequiredSkillLevel {
  skill_id: number;
  skill_name: string;
  level_id: number;
  level_value: number;
}

export interface EmployeeForMatching {
  employee_id: number;
  name: string;
  position: string;
  actual_skills_level: ActualSkillLevel[];
}

export interface ActualSkillLevel {
  skill_id: number;
  skill_name: string;
  level_id: number;
  level_value: number;
}

export interface MatchingResult {
  job_description_id: number;
  employee_id: number;
  name: string;
  position: string;
  score: number;
  skill_gap_details: SkillGapDetail[];
}

export interface SkillGapDetail {
  skill_id: number;
  skill_name: string;
  required_skill_level: number;
  actual_skill_level: number;
  gap: number;
}

export interface MatchingAnalytics {
  totalCandidates: number;
  averageScore: number;
  topScore: number;
  skillsAnalysis: SkillAnalysis[];
}

export interface SkillAnalysis {
  skill_name: string;
  averageGap: number;
  candidatesWithSkill: number;
  totalCandidates: number;
}