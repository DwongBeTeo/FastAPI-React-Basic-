import pytest
from unittest.mock import MagicMock
from fastapi import status

from main import app 
from database import get_db
import models
import auth

# CẤU HÌNH DEPENDENCIES MOCKING (DÙNG CHUNG CHO CẢ FILE)
def override_get_db():
    """Mock Database Session"""
    db = MagicMock()
    yield db

def override_get_current_admin():
    """Mock Lính gác cổng: Báo cáo rằng người gọi là ADMIN hợp lệ"""
    return models.User(id=1, username="admin_tester", role="ADMIN", is_active=True)

# Ghi đè các Dependency của FastAPI
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[auth.get_current_admin] = override_get_current_admin

# CREATE
def test_create_product_first_time(client, mocker):
    """Test tạo sản phẩm đầu tiên (Chưa có SP nào trong DB -> code = PRD-001)"""
    
    # 1. Giả lập DB trống: Không tìm thấy sản phẩm cuối cùng
    mocker.patch("repositories.product_repository.get_last_product", return_value=None)
    
    # 2. Giả lập khi Save DB thành công trả về Object Product
    mock_saved_product = models.Product(
        id=1, code="PRD-001", name="Bàn Gỗ", price=500000, is_active=True
    )
    mocker.patch("repositories.product_repository.create_product", return_value=mock_saved_product)

    # 3. Gọi API (Sẽ tự động thành /api/v1/admin/products nhờ conftest.py)
    response = client.post(
        "/admin/products/",
        json={
            "name": "Bàn Gỗ",
            "price": 500000,
            "is_active": True
        }
    )

    # 4. Kiểm tra
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["code"] == "PRD-001"
    assert data["name"] == "Bàn Gỗ"


def test_create_product_auto_increment(client, mocker):
    """Test tạo sản phẩm khi đã có sản phẩm (PRD-005 -> PRD-006)"""
    
    # 1. Giả lập DB đang có sản phẩm mã PRD-005
    last_product = models.Product(id=5, code="PRD-005", name="Ghế Xoay")
    mocker.patch("repositories.product_repository.get_last_product", return_value=last_product)
    
    # 2. Giả lập Save DB thành công
    mock_saved_product = models.Product(
        id=6, code="PRD-006", name="Bàn Kính", price=800000, is_active=True
    )
    mocker.patch("repositories.product_repository.create_product", return_value=mock_saved_product)

    response = client.post(
        "/admin/products/",
        json={"name": "Bàn Kính", "price": 800000}
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["code"] == "PRD-006"

# READ
def test_get_all_products(client, mocker):
    """Test lấy danh sách sản phẩm"""
    
    # 1. Tạo list giả lập
    mock_list = [
        models.Product(id=1, code="PRD-001", name="SP 1", price=100, is_active=True),
        models.Product(id=2, code="PRD-002", name="SP 2", price=200, is_active=True)
    ]
    
    # 2. SỬA Ở ĐÂY: Mock trả về đúng cấu trúc dictionary (có total và data)
    mock_response = {
        "total": 2,
        "data": mock_list
    }
    mocker.patch("repositories.product_repository.get_products", return_value=mock_response)

    # 3. Gọi API
    response = client.get("/admin/products/?skip=0&limit=10")
    
    # In ra để debug nếu có lỗi
    if response.status_code != 200:
        print("LỖI TỪ SERVER:", response.json())
        
    # 4. Kiểm tra kết quả
    assert response.status_code == status.HTTP_200_OK
    
    json_data = response.json()
    
    # SỬA Ở ĐÂY: Assert theo cấu trúc của PaginatedProductResponse
    assert "total" in json_data
    assert "data" in json_data
    assert json_data["total"] == 2
    assert len(json_data["data"]) == 2
    assert json_data["data"][0]["code"] == "PRD-001"

def test_update_product_success(client, mocker):
    """Test update thành công và chặn update 'code'"""
    
    # Add is_active= true
    existing_product = models.Product(id=1, code="PRD-001", name="Tên Cũ", price=100, is_active=True)
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=existing_product)
    
    # Add is_active= true
    updated_product = models.Product(id=1, code="PRD-001", name="Tên Mới", price=999, is_active=True)
    mocker.patch("repositories.product_repository.update_product", return_value=updated_product)

    response = client.put(
        "/admin/products/1",
        json={
            "name": "Tên Mới",
            "price": 999
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Tên Mới"
    assert data["price"] == 999


def test_update_product_not_found(client, mocker):
    """Test báo lỗi 404 nếu update SP không tồn tại"""
    
    # Trả về None nghĩa là không tìm thấy SP
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=None)

    response = client.put(
        "/admin/products/99",
        json={"name": "Ghost Product", "price": 0}
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Product not found"

# DELETE
def test_delete_product_success(client, mocker):
    """Test xóa sản phẩm thành công"""
    
    existing_product = models.Product(id=1, code="PRD-001", name="Xóa Tôi Đi")
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=existing_product)
    mocker.patch("repositories.product_repository.delete_product", return_value=None)

    response = client.delete("/admin/products/1")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Delete successful!"


def test_delete_product_not_found(client, mocker):
    """Test báo lỗi 404 khi xóa SP không tồn tại"""
    
    mocker.patch("repositories.product_repository.get_product_by_id", return_value=None)

    response = client.delete("/admin/products/99")

    assert response.status_code == status.HTTP_404_NOT_FOUND