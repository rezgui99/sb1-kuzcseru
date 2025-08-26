export interface Employee {
  id?: number;
  name: string;
  position: string;
  hire_date: string;
  email: string;
  phone?: string;
  gender?: string;
  location?: string;
  notes?: string;
  job_description_id?: number | null;
  jobDescription?: JobDescriptionBasic;
  skills?: EmployeeSkill[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JobDescriptionBasic {
  id: number;
  emploi: string;
  filiere_activite: string;
  famille: string;
}

export interface EmployeeSkill {
  employee_id: number;
  skill_id: number;
  skill?: Skill;
  actual_skill_level_id: number;
  SkillLevel?: SkillLevel;
  acquired_date?: string;
  certification?: string;
  last_evaluated_date?: string;
}

export interface Skill {
  id: number;
  name: string;
  description?: string;
  skill_type_id?: number;
  type?: SkillType;
}

export interface SkillType {
  id: number;
  type_name: string;
  description?: string;
}

export interface SkillLevel {
  id: number;
  level_name: string;
  description?: string;
  value: number;
}