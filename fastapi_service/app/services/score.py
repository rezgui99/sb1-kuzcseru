from typing import List, Dict
from ..models.fiche_employe import Employee, SkillLevel
from ..models.fiche_poste import JobDescription, RequiredSkillLevel
from ..models.result import Result, SkillGapDetail



# Calculer le score pour une fiche de poste et un seul employé

def calculate_score_for_employee(job_description: JobDescription, employee: Employee) -> Result:
    skill_gap_details = []
    total_corrected_level = 0
    total_required_level = 0

    employee_skills: Dict[int, SkillLevel] = {
        skill.skill_id: skill for skill in employee.actual_skills_level
    }

    for required_skill in job_description.required_skills_level:
        required_level = required_skill.level_value
        total_required_level += required_level

        if required_skill.skill_id in employee_skills:
            employee_skill = employee_skills[required_skill.skill_id]
            actual_level = employee_skill.level_value
            corrected_level = min(actual_level, required_level)
            total_corrected_level += corrected_level
            gap = actual_level - required_level
        else:
            actual_level = 0
            gap = -required_level
            corrected_level = 0

        skill_gap_details.append(SkillGapDetail(
            skill_id=required_skill.skill_id,
            skill_name=required_skill.skill_name,
            required_skill_level=required_level,
            actual_skill_level=actual_level,
            gap=gap
        ))

    score = (total_corrected_level / total_required_level) * 100 if total_required_level > 0 else 0

    return Result(
        job_description_id=job_description.job_description_id,
        employee_id=employee.employee_id,
        name=employee.name,
        position=employee.position,
        score=round(score, 2),
        skill_gap_details=skill_gap_details
    )
    
    

# Calculer le score pour une fiche de poste et une liste d'employés

def calculate_score(job_description: JobDescription, employees: List[Employee]) -> List[Result]:
    results = []
    for employee in employees:
        result = calculate_score_for_employee(job_description, employee)
        results.append(result)
    return results


# Filtrer les meilleurs employés

def get_top_employees(results: List[Result], threshold: float = 70.0, top_n: int = 10) -> List[Result]:
    # Filtrer ceux qui atteignent le seuil
    filtered = [r for r in results if r.score >= threshold]
    # Trier par score décroissant
    sorted_results = sorted(filtered, key=lambda r: r.score, reverse=True)
    # Retourner les top N
    return sorted_results[:top_n]



