import pytest
from unittest.mock import MagicMock
from fastapi import status
from datetime import date, datetime, timedelta
import calendar
from main import app 
from database import get_db
import models
import auth
from schemas.data_access import SubscriptionTypeEnum
from models.promotion import DiscountTypeEnum
class DummyDiscountType:
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"

# CẤU HÌNH DEPENDENCIES MOCKING

@pytest.fixture(autouse=True)
def setup_dependency_overrides():
    """Fixture này tự động chạy TRƯỚC mỗi test để mock DB và User, 
    sau đó tự động dọn dẹp SAU MỖI test"""
    
    def override_get_db():
        db = MagicMock()
        yield db

    def override_get_current_user():
        return models.User(id=2, username="normal_user", role="USER", is_active=True)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[auth.get_current_user] = override_get_current_user
    
    yield # Cho phép test chạy
    
    # Dọn dẹp: Reset lại toàn bộ overrides sau khi test chạy xong
    app.dependency_overrides = {}

# HÀM HỖ TRỢ TÍNH NGÀY THÁNG ĐỂ TEST KHÔNG BAO GIỜ BỊ OUTDATE
today = date.today()

def get_last_month():
    first_day_of_this_month = today.replace(day=1)
    last_day_of_prev_month = first_day_of_this_month - timedelta(days=1)
    first_day_of_prev_month = last_day_of_prev_month.replace(day=1)
    return first_day_of_prev_month, last_day_of_prev_month

def get_next_month_start():
    if today.month == 12:
        return today.replace(year=today.year + 1, month=1, day=1)
    return today.replace(month=today.month + 1, day=1)

# MOCK HELPER: GIẢ LẬP HÀM LƯU VÀO DATABASE
def mock_db_save(db, request, items):
    """
    Giả lập hàm create_request_with_items của repository.
    Gắn ID giả và nhét items vào request y hệt như SQLAlchemy flush().
    """
    request.id = 99
    request.items = items
    for i, item in enumerate(items):
        item.id = i + 1
        item.request_id = request.id
    return request

# TEST CASES
def test_create_historical_request_success(client, mocker):
    """Test 1: Tạo yêu cầu HISTORICAL thành công (mua dữ liệu tháng trước)"""
    
    start_prev_month, end_prev_month = get_last_month()
    
    # 1. Mock DB: Sản phẩm giá 100k
    mock_product = models.Product(
        id=1, name="Data Stock A", price=100000, 
        available_from=date(2020, 1, 1), available_to=None
    )
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=mock_product)
    
    # 2. Mock DB: Không có yêu cầu nào trùng lặp, không có promo
    mocker.patch("services.request_service._validate_and_get_promotion", return_value=(None, None, 0.0,0))
    mocker.patch("repositories.request_repository.get_pending_request_item", return_value=None)
    mocker.patch("repositories.request_repository.get_overlapping_approved_item", return_value=None)
    mocker.patch("repositories.request_repository.get_last_request_by_prefix", return_value=None)
    
    # 3. Mock DB: Hàm lưu (Transaction)
    mocker.patch("repositories.request_repository.create_request_with_items", side_effect=mock_db_save)
    
    # GỌI API (Route User)
    response = client.post(
        "/requests/",
        json={
            "items": [
                {
                    "product_id": 1,
                    "access_type": "API",
                    "subscription_type": "HISTORICAL",
                    "from_date": start_prev_month.isoformat(),
                    "to_date": end_prev_month.isoformat()
                }
            ],
            "promotion_code": None
        }
    )
    
    # KIỂM TRA KẾT QUẢ
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PENDING"
    assert data["total_amount"] == 100000  # Mua 1 tháng giá 100k
    assert data["items"][0]["calculated_months"] == 1


def test_create_ongoing_request_with_promotion(client, mocker):
    """Test 2: Tạo yêu cầu ONGOING (từ tháng sau) có dùng mã giảm giá 10%"""
    
    next_month_start = get_next_month_start()
    
    mock_product = models.Product(
        id=1, name="Data Stock A", price=500000, 
        available_from=date(2020, 1, 1), available_to=None
    )
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=mock_product)
    
    # SỬA LỖI 2 TẠI ĐÂY: Dùng đúng DiscountTypeEnum thay vì DummyDiscountType
    mocker.patch(
        "services.request_service._validate_and_get_promotion", 
        return_value=(5, DiscountTypeEnum.PERCENTAGE, 10.0, 0)
    )
    
    mocker.patch("repositories.request_repository.get_pending_request_item", return_value=None)
    mocker.patch("repositories.request_repository.get_overlapping_approved_item", return_value=None)
    mocker.patch("repositories.request_repository.get_last_request_by_prefix", return_value=None)
    mocker.patch("repositories.request_repository.create_request_with_items", side_effect=mock_db_save)

    # Thêm mock để tránh bị lỗi khi query lấy object promotion ra để trừ số lượng
    mocker.patch("repositories.promotion_repository.get_promotion_by_id", return_value=None)

    # Giả lập các thao tác của DB Session để tránh lỗi SQLAlchemy
    mocker.patch("sqlalchemy.orm.Session.commit", return_value=None)
    mocker.patch("sqlalchemy.orm.Session.refresh", return_value=None)

    response = client.post(
        "/requests/",
        json={
            "items": [
                {
                    "product_id": 1,
                    "access_type": "WEB",
                    "subscription_type": "ONGOING",
                    "from_date": next_month_start.isoformat(),
                    "to_date": None  # Mua vô thời hạn (cọc 1 tháng đầu)
                }
            ],
            "promotion_code": "SALE10"
        }
    )
    
    # In ra lỗi từ server
    if response.status_code != 200:
        print("LỖI TỪ SERVER:", response.json())
        
    assert response.status_code == 200
    data = response.json()
    
    # Giá gốc 500k, giảm 10% -> 450k
    assert data["total_amount"] == 450000
    assert data["promotion_id"] == 5
    assert data["items"][0]["calculated_months"] == 1
    assert data["items"][0]["applied_price"] == 450000

def test_create_historical_missing_to_date(client, mocker):
    """Test 3: Cố tình mua HISTORICAL nhưng quên không truyền to_date -> Lỗi 400"""
    
    start_prev_month, _ = get_last_month()
    
    mock_product = models.Product(id=1, name="Data Stock A", price=100000, available_from=date(2020, 1, 1))
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=mock_product)
    mocker.patch("services.request_service._validate_and_get_promotion", return_value=(None, None, 0.0, 0))

    response = client.post(
        "/requests/",
        json={
            "items": [
                {
                    "product_id": 1,
                    "access_type": "API",
                    "subscription_type": "HISTORICAL",
                    "from_date": start_prev_month.isoformat(),
                    "to_date": None  # THIẾU TRƯỜNG NÀY
                }
            ]
        }
    )
    
    assert response.status_code == 400
    assert "requires a 'to_date'" in response.json()["detail"]


def test_create_request_duplicate_pending(client, mocker):
    """Test 4: Chặn nếu người dùng đang có hóa đơn PENDING cho chính sản phẩm này"""
    
    start_prev_month, end_prev_month = get_last_month()
    
    mock_product = models.Product(id=1, name="Data Stock A", price=100000)
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=mock_product)
    mocker.patch("services.request_service._validate_and_get_promotion", return_value=(None, None, 0.0, 0))
    
    # Giả lập Database báo rằng: "Ông này đang có 1 đơn PENDING món này rồi" (trả về True/Object)
    mocker.patch("repositories.request_repository.get_pending_request_item", return_value=models.DataRequestItem(id=99))

    response = client.post(
        "/requests/",
        json={
            "items": [
                {
                    "product_id": 1,
                    "access_type": "API",
                    "subscription_type": "HISTORICAL",
                    "from_date": start_prev_month.isoformat(),
                    "to_date": end_prev_month.isoformat()
                }
            ]
        }
    )
    
    assert response.status_code == 400
    assert "A pending request for Product ID 1 already exists" in response.json()["detail"]


# Access guard
def test_idor_data_request_guard(client, mocker):
    """Test A: Chống IDOR - User A không được xem Data Request của User B"""
    
    # 1. Ghi đè lại User thành id=1 (Chỉ có tác dụng trong test này)
    app.dependency_overrides[auth.get_current_user] = lambda: models.User(id=1, username="user_A", role="USER", is_active=True)
    
    mock_request_of_user_b = models.DataRequest(
        id=99, user_id=2, reference_code="REQ-B-001", status="PENDING"
    )
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=mock_request_of_user_b)
    
    response = client.get("/requests/99")
    
    # XÓA dòng app.dependency_overrides.pop(...) ở đây
    
    assert response.status_code in [403, 404]
    if response.status_code == 403:
        assert "permission" in response.json()["detail"].lower()


def test_access_guard_product_data_forbidden(client, mocker):
    """Test B: Chặn User xem dữ liệu của Sản phẩm khi CHƯA MUA (hoặc hết hạn)"""
    
    # 1. Ghi đè lại User thành id=1
    app.dependency_overrides[auth.get_current_user] = lambda: models.User(id=1, username="user_A", role="USER", is_active=True)
    
    mocker.patch("repositories.access_repository.get_valid_access_by_user_and_product", return_value=None)
    
    response = client.get("/access/5/data") 
    
    # XÓA dòng app.dependency_overrides.pop(...) ở đây
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json()["detail"] == "You do not have permission to access this product or your access has expired."