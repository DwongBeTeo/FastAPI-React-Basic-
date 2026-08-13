from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas
from database import get_db
from services import user_promotion_service
import auth

# routers/promotions.py (USER)
router = APIRouter(
    prefix="/promotions",
    tags=["User Promotions"]
)

@router.get("/check/{code}", response_model=schemas.PromotionCheckResponse)
def check_promotion(
    code: str, 
    db: Session = Depends(get_db),
    current_user: int = Depends(auth.get_current_user)
):
    return user_promotion_service.check_promotion_code(db, code)