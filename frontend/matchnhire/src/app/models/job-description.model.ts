export interface JobDescription {
  id?: number;
  emploi: string;
  filiere_activite: string;
  famille: string;
  superieur_n1?: number | null;
  superieur_n2?: number | null;
  finalite?: string;
  niveau_exigence?: string;
  niveau_exp?: string;
  status?: string;
  version?: string;
  missions?: Mission[];
  moyens?: Moyen[];
  airesProximites?: AireProximite[];
  requiredSkills?: JobRequiredSkill[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Mission {
  id?: number;
  mission: string;
}

export interface Moyen {
  id?: number;
  moyen: string;
}

export interface AireProximite {
  id?: number;
  poste: string;
  nombre: number;
}

export interface JobRequiredSkill {
  job_description_id: number;
  skill_id: number;
  skill?: Skill;
  required_skill_level_id: number;
  skill_level?: SkillLevel;
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