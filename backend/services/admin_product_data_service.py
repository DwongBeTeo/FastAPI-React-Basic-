# services/admin_product_data_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas

# Import required repositories
from repositories import product_repository, product_data_repository

def create_product_data(db: Session, data_in: schemas.ProductDataCreate):
    try:
        # 1. Validate if the product exists
        product = product_repository.get_product_by_id(db, data_in.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {data_in.product_id} not found.")
            
        # 2. Prepare the model instance
        new_data = models.ProductData(**data_in.model_dump())
        
        # 3. Call repository to add to the current session
        created_data = product_data_repository.create_product_data(db, new_data)
        db.commit()
        db.refresh(created_data)
        return created_data

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error during product data creation: {str(e)}"
        )


def get_all_product_data(db: Session, product_id: int = None, skip: int = 0, limit: int = 100):
    # Read-only operation, no transaction boundary needed
    return product_data_repository.get_all_product_data(db, product_id, skip, limit)


def update_product_data(db: Session, data_id: int, data_in: schemas.ProductDataUpdate):
    # Retrieve data using Repository (Handling 404 outside the try-catch block)
    db_data = product_data_repository.get_product_data_by_id(db, data_id)
    if not db_data:
        raise HTTPException(status_code=404, detail="Product data not found.")
        
    try:
        update_dict = data_in.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_data, key, value)
            
        # Call repository to flush changes
        updated_data = product_data_repository.update_product_data(db, db_data)
        db.commit()
        db.refresh(updated_data)
        return updated_data

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while updating product data: {str(e)}"
        )


def delete_product_data(db: Session, data_id: int):
    # Retrieve data using Repository
    db_data = product_data_repository.get_product_data_by_id(db, data_id)
    if not db_data:
        raise HTTPException(status_code=404, detail="Product data not found.")
        
    try:
        # Call repository to prepare for deletion
        product_data_repository.delete_product_data(db, db_data)
        db.commit()
        return {"message": "Product data deleted successfully."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"System error while deleting product data: {str(e)}"
        )