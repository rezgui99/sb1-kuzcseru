from pydantic import BaseModel
from typing import List

class SkillLevel(BaseModel):
    skill_id: int
    skill_name: str
    level_id: int
    level_value: int

class Employee(BaseModel):
    employee_id: int
    name: str                  
    position: str
    actual_skills_level: List[SkillLevel]