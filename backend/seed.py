from sqlalchemy.orm import Session
from database import SessionLocal, engine
from sqlalchemy import text
from models import User, Product, ProductData, DataRequest, DataRequestItem, UserDataAccess, Promotion
from database import Base
import auth
from datetime import date, datetime

def seed_database(db: Session):
    print("--- 1. Start seed Users ---")
    users = [
        {"email": "admin@sdd.local", "username": "admin", "password": "123", "role": "ADMIN", "is_active": True},
        {"email": "user1@sdd.local", "username": "user1", "password": "123", "role": "USER", "is_active": True},
        {"email": "user2@sdd.local", "username": "user2", "password": "123", "role": "USER", "is_active": True},
    ]
    for u in users:
        # Check bằng email (trường unique) thay vì ID
        if not db.query(User).filter(User.email == u["email"]).first():
            hashed_pwd = auth.get_password_hash(u["password"])
            db.add(User(
                email=u["email"], 
                username=u["username"], 
                hashed_password=hashed_pwd, 
                role=u["role"], 
                is_active=u["is_active"]
            ))
    db.commit()

    print("--- 2. Start seed Products ---")
    products = [
        {"code": "PRD-001", "name": "Daily Sales Report", "price": 500000, "is_active": True},
        {"code": "PRD-002", "name": "Inventory Snapshot", "price": 300000, "is_active": True},
        {"code": "PRD-003", "name": "Customer Insights", "price": 1200000, "is_active": True},
    ]
    for p in products:
        # Check bằng mã sản phẩm code (trường unique)
        if not db.query(Product).filter(Product.code == p["code"]).first():
            db.add(Product(**p))
    db.commit()

    print("--- 3. Start seed Promotions ---")
    promotions = [
        {"code": "WELCOME2026", "description": "Giảm 20%", "discount_type": "PERCENTAGE", "discount_value": 20.0, "min_order_value": 0, "quantity": 100, "is_active": True, "expiration_date": date(2026, 12, 31)},
        {"code": "SALE500K", "description": "Giảm 500K", "discount_type": "FIXED", "discount_value": 500000.0, "min_order_value": 2000000, "quantity": 50, "is_active": True, "expiration_date": date(2026, 12, 31)},
    ]
    for promo in promotions:
        if not db.query(Promotion).filter(Promotion.code == promo["code"]).first():
            db.add(Promotion(**promo))
    db.commit()

    print("--- 4. Start seed DataRequest ---")
    requests = [
        {"reference_code": "REQ-2026-0101", "user_email": "user1@sdd.local", "status": "APPROVED", "reviewer_email": "admin@sdd.local"},
        {"reference_code": "REQ-2026-0102", "user_email": "user1@sdd.local", "status": "PENDING", "reviewer_email": None},
        {"reference_code": "REQ-2026-0103", "user_email": "user2@sdd.local", "status": "REJECTED", "reviewer_email": "admin@sdd.local"},
    ]
    for r in requests:
        if not db.query(DataRequest).filter(DataRequest.reference_code == r["reference_code"]).first():
            # Tìm ID user và reviewer từ Database
            user = db.query(User).filter(User.email == r["user_email"]).first()
            reviewer = db.query(User).filter(User.email == r["reviewer_email"]).first() if r.get("reviewer_email") else None
            
            if user:
                db.add(DataRequest(
                    reference_code=r["reference_code"],
                    user_id=user.id,
                    status=r["status"],
                    reviewed_by=reviewer.id if reviewer else None
                ))
    db.commit()

    print("--- 5. Start seed DataRequestItem ---")
    # Đã thêm subscription_type theo model của bạn
    items = [
        {"request_code": "REQ-2026-0101", "product_code": "PRD-001", "access_type": "DOWNLOAD", "subscription_type": "HISTORICAL", "from_date": date(2026, 4, 1), "to_date": date(2026, 6, 30)},
        {"request_code": "REQ-2026-0101", "product_code": "PRD-002", "access_type": "VIEW", "subscription_type": "HISTORICAL", "from_date": date(2026, 5, 1), "to_date": date(2026, 5, 31)},
        {"request_code": "REQ-2026-0102", "product_code": "PRD-003", "access_type": "VIEW", "subscription_type": "ONGOING", "from_date": date(2026, 6, 1), "to_date": date(2026, 6, 30)},
        {"request_code": "REQ-2026-0103", "product_code": "PRD-001", "access_type": "DOWNLOAD", "subscription_type": "HISTORICAL", "from_date": date(2026, 1, 1), "to_date": date(2026, 3, 31)},
    ]
    for i in items:
        # Link với ID thật lấy từ DB
        req = db.query(DataRequest).filter(DataRequest.reference_code == i["request_code"]).first()
        prod = db.query(Product).filter(Product.code == i["product_code"]).first()
        
        if req and prod:
            exists = db.query(DataRequestItem).filter(
                DataRequestItem.request_id == req.id, 
                DataRequestItem.product_id == prod.id
            ).first()
            if not exists:
                db.add(DataRequestItem(
                    request_id=req.id,
                    product_id=prod.id,
                    access_type=i["access_type"],
                    subscription_type=i["subscription_type"],
                    from_date=i["from_date"],
                    to_date=i["to_date"]
                ))
    db.commit()

    print("--- 6. Start seed UserDataAccess ---")
    accesses = [
        {"user_email": "user1@sdd.local", "product_code": "PRD-001", "request_code": "REQ-2026-0101", "granted_at": datetime(2026, 8, 5, 9, 30), "expires_at": datetime(2026, 9, 5, 23, 59), "is_active": True},
        {"user_email": "user1@sdd.local", "product_code": "PRD-002", "request_code": "REQ-2026-0101", "granted_at": datetime(2026, 8, 5, 9, 30), "expires_at": datetime(2026, 9, 5, 23, 59), "is_active": True},
    ]
    for a in accesses:
        usr = db.query(User).filter(User.email == a["user_email"]).first()
        prod = db.query(Product).filter(Product.code == a["product_code"]).first()
        req = db.query(DataRequest).filter(DataRequest.reference_code == a["request_code"]).first()
        
        if usr and prod and req:
            exists = db.query(UserDataAccess).filter(
                UserDataAccess.user_id == usr.id,
                UserDataAccess.product_id == prod.id,
                UserDataAccess.request_id == req.id
            ).first()
            if not exists:
                db.add(UserDataAccess(
                    user_id=usr.id,
                    product_id=prod.id,
                    request_id=req.id,
                    granted_at=a["granted_at"],
                    expires_at=a["expires_at"],
                    is_active=a["is_active"]
                ))
    db.commit()

    print("--- 7. Start seed ProductData ---")
    p_data = [
        {"product_code": "PRD-001", "data_date": date(2026, 3, 31), "content": "Sales before approved range"},
        {"product_code": "PRD-001", "data_date": date(2026, 4, 15), "content": "April sales data"},
        {"product_code": "PRD-001", "data_date": date(2026, 5, 20), "content": "May sales data"},
        {"product_code": "PRD-001", "data_date": date(2026, 6, 30), "content": "June sales data"},
        {"product_code": "PRD-001", "data_date": date(2026, 7, 1), "content": "Sales after approved range"},
        {"product_code": "PRD-002", "data_date": date(2026, 5, 10), "content": "Inventory snapshot"},
        {"product_code": "PRD-003", "data_date": date(2026, 6, 15), "content": "Customer insight data"},
    ]
    for pd in p_data:
        prod = db.query(Product).filter(Product.code == pd["product_code"]).first()
        if prod:
            exists = db.query(ProductData).filter(
                ProductData.product_id == prod.id,
                ProductData.data_date == pd["data_date"],
                ProductData.content == pd["content"]
            ).first()
            if not exists:
                db.add(ProductData(
                    product_id=prod.id,
                    data_date=pd["data_date"],
                    content=pd["content"]
                ))
    db.commit()

def sync_pg_sequences(db: Session):
    print("--- synchronize PostgreSQL Sequences ---")
    tables = [
        "users", "products", "promotions", "data_requests", 
        "data_request_items", "user_data_access", "product_data"
    ]
    
    for table in tables:
        try:
            sync_sql = text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE((SELECT MAX(id) FROM {table}), 1));")
            db.execute(sync_sql)
            db.commit()
            print(f"  -> Synchronized sequence for table: {table}")
        except Exception as e:
            db.rollback()
            print(f"  -> [WARNING] Could not sync table {table}. Error: {e}")
            
    print(">>> Synchronize Sequence successful <<<")

def run_seed():
    db = SessionLocal()
    try:
        seed_database(db)
        print(">>> Seed data SDD system successful <<<")
    except Exception as e:
        print(f">>> Lỗi seed: {e}")
        db.rollback()
    finally:
        sync_pg_sequences(db)
        db.close()

if __name__ == "__main__":
    run_seed()