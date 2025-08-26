from pydantic import BaseModel
from typing import List

class RequiredSkillLevel(BaseModel):
    skill_id: int
    skill_name: str
    level_id: int
    level_value: int

class JobDescription(BaseModel):
    job_description_id: int
    required_skills_level: List[RequiredSkillLevel]