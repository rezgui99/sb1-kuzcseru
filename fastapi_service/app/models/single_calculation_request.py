from pydantic import BaseModel
from app.models.fiche_poste import JobDescription
from app.models.fiche_employe import Employee

class SingleCalculationRequest(BaseModel):
    job_description: JobDescription
    employee: Employee
