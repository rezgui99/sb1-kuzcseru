from fastapi import APIRouter
from typing import List
from app.models.fiche_poste import JobDescription
from app.models.fiche_employe import Employee
from app.models.result import Result
from app.models.single_calculation_request import SingleCalculationRequest
from app.services.score import calculate_score_for_employee
from app.services.score import calculate_score, get_top_employees



router = APIRouter()


@router.post("/calculate/one", response_model=Result)
def calculate_one(req: SingleCalculationRequest):
    return calculate_score_for_employee(req.job_description, req.employee)

@router.post("/calculate", response_model=List[Result])
def calculate(job_description: JobDescription, employees: List[Employee]):
    results = calculate_score(job_description, employees)
    return results

@router.post("/calculate/top", response_model=List[Result])
def calculate_top(job_description: JobDescription, employees: List[Employee], threshold: float = 70.0):
    results = calculate_score(job_description, employees)
    top = get_top_employees(results, threshold=threshold)
    return top




