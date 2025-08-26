from fastapi import FastAPI
from app.api.v1 import calcul

app = FastAPI()

# ✅ Route par défaut "/"
@app.get("/")
def root():
    return {"message": "welcome to fast api service"}

# ✅ Inclusion du routeur calcul
app.include_router(calcul.router, prefix="/api/v1", tags=["Calcul"])
