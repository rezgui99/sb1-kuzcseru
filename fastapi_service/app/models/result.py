from pydantic import BaseModel
from typing import List

class SkillGapDetail(BaseModel):
    skill_id: int
    skill_name: str
    required_skill_level: int
    actual_skill_level: int
    gap: int

class Result(BaseModel):
    job_description_id: int
    employee_id: int
    name: str                 # ➕ Added
    position: str 
    score: float
    skill_gap_details: List[SkillGapDetail]