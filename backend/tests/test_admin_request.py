import pytest
from unittest.mock import MagicMock
from fastapi import status
from datetime import date, datetime

from main import app 
from database import get_db
import models
import auth
from schemas.data_access import SubscriptionTypeEnum

# CẤU HÌNH DEPENDENCIES MOCKING CHO TOÀN BỘ FILE
def override_get_db():
    db = MagicMock()
    yield db

def override_get_current_admin():
    """Mock Admin đang đăng nhập (ID = 1)"""
    return models.User(id=1, username="admin_super", role="ADMIN", is_active=True)

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[auth.get_current_admin] = override_get_current_admin

# HELPER TẠO DỮ LIỆU MOCK DÙNG CHUNG
def get_mock_pending_request():
    """Tạo ra một DataRequest giả đang ở trạng thái PENDING"""
    mock_item = models.DataRequestItem(
        id=10, 
        request_id=1, 
        product_id=100, 
        access_type="API", 
        subscription_type=SubscriptionTypeEnum.HISTORICAL,
        from_date=date(2023, 1, 1),
        calculated_months=1,
        applied_price=50000
    )
    
    return models.DataRequest(
        id=1,
        reference_code="REQ-20231010-0001",
        user_id=2, # User bình thường có ID là 2
        status="PENDING",
        total_amount=50000,
        items=[mock_item]
    )

# TEST CASES CHO ADMIN (APPROVE & REJECT)
def test_approve_request_success(client, mocker):
    """Test Admin phê duyệt yêu cầu thành công và tạo UserDataAccess"""
    
    mock_request = get_mock_pending_request()
    
    # 1. Giả lập tìm thấy Request
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=mock_request)
    
    # 2. Giả lập User CHƯA CÓ quyền truy cập món này (trả về None)
    mocker.patch("repositories.access_repository.get_active_user_access", return_value=None)
    
    # 3. Giả lập việc tạo Quyền truy cập thành công (hàm này ko return gì quan trọng, chỉ cần ko lỗi)
    mocker.patch("repositories.access_repository.add_user_access", return_value=None)

    # 4. Gọi API
    response = client.put("/admin/requests/1/approve")
    
    # 5. Kiểm tra kết quả
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "APPROVED"
    assert data["reviewed_by"] == 1  # ID của admin mock ở trên
    
    # Đảm bảo hàm tạo UserDataAccess thực sự được gọi!
    access_repository_mock = mocker.patch("repositories.access_repository.add_user_access")
    # (Tùy chọn nâng cao: Bạn có thể verify xem nó có chạy vào lệnh db.add(new_access) hay không)


def test_reject_request_success(client, mocker):
    """Test Admin từ chối yêu cầu thành công"""
    
    mock_request = get_mock_pending_request()
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=mock_request)

    # Gọi API Reject
    response = client.put("/admin/requests/1/reject")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "REJECTED"
    assert data["reviewed_by"] == 1


def test_process_request_not_found(client, mocker):
    """Test báo lỗi 404 nếu Request ID không tồn tại trong DB"""
    
    # Trả về None nghĩa là không tìm thấy
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=None)

    response = client.put("/admin/requests/999/approve")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Request not found."


def test_process_request_already_processed(client, mocker):
    """Test báo lỗi 400 nếu cố duyệt 1 hóa đơn đã xử lý rồi"""
    
    mock_request = get_mock_pending_request()
    # Cố tình đổi trạng thái thành APPROVED
    mock_request.status = "APPROVED" 
    
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=mock_request)

    response = client.put("/admin/requests/1/approve")
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already been processed" in response.json()["detail"]


def test_approve_request_skip_existing_access(client, mocker):
    """Test luồng duyệt thành công nhưng BỎ QUA tạo Quyền nếu User đã có quyền rồi"""
    
    mock_request = get_mock_pending_request()
    mocker.patch("repositories.request_repository.get_request_by_id", return_value=mock_request)
    
    # Giả lập: User ĐÃ CÓ quyền (trả về 1 Object thay vì None)
    existing_access = models.UserDataAccess(id=5)
    mocker.patch("repositories.access_repository.get_active_user_access", return_value=existing_access)
    
    # Mock hàm add (cắm Spy vào để theo dõi xem nó có bị gọi không)
    mock_add_access = mocker.patch("repositories.access_repository.add_user_access")

    response = client.put("/admin/requests/1/approve")
    
    assert response.status_code == status.HTTP_200_OK
    
    # Xác nhận hàm add_user_access KHÔNG ĐƯỢC GỌI LẦN NÀO vì đã bị if not existing_access chặn lại
    mock_add_access.assert_not_called()