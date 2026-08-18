# services/access_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from datetime import datetime
import models
from repositories import access_repository, request_repository, product_data_repository
from utils.audit_logger import write_audit_log
def get_my_accesses(db: Session, user_id: int):
    """Retrieve valid access tickets for UI display."""
    now = datetime.now()
    return access_repository.get_active_accesses_by_user(db, user_id, now)

def get_product_data(db: Session, user_id: int, product_id: int, bg_tasks: BackgroundTasks):
    """
    Core API system: Validate access rights and return actual filtered data.
    """
    now = datetime.now()
    
    # STEP 1: PERMISSION CHECK (Gatekeeper)
    valid_access = access_repository.get_valid_access_by_user_and_product(db, user_id, product_id, now)

    if not valid_access:

        # LOG: TRUY CẬP TRÁI PHÉP
        write_audit_log(
            db=db,
            actor_id=user_id,
            action="ACCESS_DENIED", # Hành động bị từ chối
            entity_type="PRODUCT",
            entity_id=product_id,
            payload={"reason": "The user does not have permission, or the permission has expired."}
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this product or your access has expired."
        )

    # STEP 2: FIND DATE SCOPE
    request_item = request_repository.get_request_item(db, valid_access.request_id, product_id)

    if not request_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original request details could not be found."
        )

    # STEP 3: RETURN FILTERED ACTUAL DATA
    data = product_data_repository.get_product_data_by_date_range(
        db, 
        product_id=product_id, 
        start_date=request_item.from_date, 
        end_date=request_item.to_date
    )

    # LOG: TRUY CẬP THÀNH CÔNG
    bg_tasks.add_task(
        write_audit_log,
        db=db,
        actor_id=user_id,
        action="VIEW_DATA", # Hành động xem dữ liệu thành công
        entity_type="PRODUCT",
        entity_id=product_id,
        payload={"accessed_endpoint": f"/data/{product_id}", "status": "Success"}
    )

    return data