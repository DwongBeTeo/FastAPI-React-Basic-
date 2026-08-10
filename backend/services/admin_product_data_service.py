# services/admin_product_data_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas

# Import các Repositories cần thiết
from repositories import product_repository, product_data_repository

def create_product_data(db: Session, data_in: schemas.ProductDataCreate):
    # Sử dụng lại repository của Product đã tạo ở file trước để kiểm tra tồn tại
    product = product_repository.get_product_by_id(db, data_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Sản phẩm ID {data_in.product_id} không tồn tại.")
        
    new_data = models.ProductData(**data_in.model_dump())
    
    # Gọi repo để lưu
    return product_data_repository.create_product_data(db, new_data)

def get_all_product_data(db: Session, product_id: int = None, skip: int = 0, limit: int = 100):
    return product_data_repository.get_all_product_data(db, product_id, skip, limit)

def update_product_data(db: Session, data_id: int, data_in: schemas.ProductDataUpdate):
    # Lấy dữ liệu qua Repo
    db_data = product_data_repository.get_product_data_by_id(db, data_id)
    if not db_data:
        raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu.")
        
    update_dict = data_in.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_data, key, value)
        
    # Gọi Repo để lưu cập nhật
    return product_data_repository.update_product_data(db, db_data)

def delete_product_data(db: Session, data_id: int):
    # Lấy dữ liệu qua Repo
    db_data = product_data_repository.get_product_data_by_id(db, data_id)
    if not db_data:
        raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu.")
        
    # Gọi Repo để xóa
    product_data_repository.delete_product_data(db, db_data)
    
    return {"message": "Đã xóa dữ liệu thành công."}