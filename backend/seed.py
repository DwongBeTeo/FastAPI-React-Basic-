from sqlalchemy.orm import Session
from database import SessionLocal, engine
from sqlalchemy import text
from models import User, Product, ProductData, DataRequest, DataRequestItem, UserDataAccess
from database import Base
import auth
from datetime import date, datetime

def seed_database(db: Session):
    print("--- 1. Start seed Users ---")
    users = [
        {"id": 1, "email": "admin@sdd.local", "username": "admin", "password": "123", "role": "ADMIN", "is_active": True},
        {"id": 2, "email": "user1@sdd.local", "username": "user1", "password": "123", "role": "USER", "is_active": True},
        {"id": 3, "email": "user2@sdd.local", "username": "user2", "password": "123", "role": "USER", "is_active": True},
    ]
    for u in users:
        if not db.query(User).filter(User.id == u["id"]).first():
            hashed_pwd = auth.get_password_hash(u["password"])
            db.add(User(id=u["id"], email=u["email"], username=u["username"], hashed_password=hashed_pwd, role=u["role"], is_active=u["is_active"]))
    db.commit()

    print("--- 2. Start seed Products ---")
    products = [
        {"id": 1, "code": "PRD-001", "name": "Daily Sales Report", "price": 500000, "is_active": True},
        {"id": 2, "code": "PRD-002", "name": "Inventory Snapshot", "price": 300000, "is_active": True},
        {"id": 3, "code": "PRD-003", "name": "Customer Insights", "price": 1200000, "is_active": True},
    ]
    for p in products:
        if not db.query(Product).filter(Product.id == p["id"]).first():
            db.add(Product(**p))
    db.commit()

    print("--- 3. start seed DataRequest ---")
    # Đã sửa ID thành 1, 2, 3
    requests = [
        {"id": 1, "reference_code": "REQ-2026-0101", "user_id": 2, "status": "APPROVED", "reviewed_by": 1},
        {"id": 2, "reference_code": "REQ-2026-0102", "user_id": 2, "status": "PENDING", "reviewed_by": None},
        {"id": 3, "reference_code": "REQ-2026-0103", "user_id": 3, "status": "REJECTED", "reviewed_by": 1},
    ]
    for r in requests:
        if not db.query(DataRequest).filter(DataRequest.id == r["id"]).first():
            db.add(DataRequest(**r))
    db.commit()

    print("--- 4. Start seed DataRequestItem ---")
    items = [
        {"id": 1, "request_id": 1, "product_id": 1, "access_type": "DOWNLOAD", "from_date": date(2026, 4, 1), "to_date": date(2026, 6, 30)},
        {"id": 2, "request_id": 1, "product_id": 2, "access_type": "VIEW", "from_date": date(2026, 5, 1), "to_date": date(2026, 5, 31)},
        {"id": 3, "request_id": 2, "product_id": 3, "access_type": "VIEW", "from_date": date(2026, 6, 1), "to_date": date(2026, 6, 30)},
        {"id": 4, "request_id": 3, "product_id": 1, "access_type": "DOWNLOAD", "from_date": date(2026, 1, 1), "to_date": date(2026, 3, 31)},
    ]
    for i in items:
        if not db.query(DataRequestItem).filter(DataRequestItem.id == i["id"]).first():
            db.add(DataRequestItem(**i))
    db.commit()

    print("--- 5. Start seed UserDataAccess ---")
    accesses = [
        {"id": 1, "user_id": 2, "product_id": 1, "request_id": 1, "granted_at": datetime(2026, 8, 5, 9, 30), "expires_at": datetime(2026, 9, 5, 23, 59), "is_active": True},
        {"id": 2, "user_id": 2, "product_id": 2, "request_id": 1, "granted_at": datetime(2026, 8, 5, 9, 30), "expires_at": datetime(2026, 9, 5, 23, 59), "is_active": True},
    ]
    for a in accesses:
        if not db.query(UserDataAccess).filter(UserDataAccess.id == a["id"]).first():
            db.add(UserDataAccess(**a))
    db.commit()

    print("--- 6. Start seed ProductData ---")
    p_data = [
        {"id": 1, "product_id": 1, "data_date": date(2026, 3, 31), "content": "Sales before approved range"},
        {"id": 2, "product_id": 1, "data_date": date(2026, 4, 15), "content": "April sales data"},
        {"id": 3, "product_id": 1, "data_date": date(2026, 5, 20), "content": "May sales data"},
        {"id": 4, "product_id": 1, "data_date": date(2026, 6, 30), "content": "June sales data"},
        {"id": 5, "product_id": 1, "data_date": date(2026, 7, 1), "content": "Sales after approved range"},
        {"id": 6, "product_id": 2, "data_date": date(2026, 5, 10), "content": "Inventory snapshot"},
        {"id": 7, "product_id": 3, "data_date": date(2026, 6, 15), "content": "Customer insight data"},
    ]
    for pd in p_data:
        if not db.query(ProductData).filter(ProductData.id == pd["id"]).first():
            db.add(ProductData(**pd))
    db.commit()

def sync_pg_sequences(db: Session):
    print("--- synchronize PostgreSQL Sequences ---")
    tables = [
        "users", "products", "data_requests", 
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