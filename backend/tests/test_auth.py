import pytest
from unittest.mock import MagicMock

from main import app 
from database import get_db
import models
import auth

# Configuration DATABASE SESSION
def override_get_db():
    """Tạo ra một Database Session giả (MagicMock). 
    Khi code gọi db.commit() hay db.refresh(), nó sẽ giả vờ thành công mà không làm gì cả."""
    db = MagicMock()
    yield db

# Use mock API for every API in this file
app.dependency_overrides[get_db] = override_get_db


# TEST: (REGISTER)
def test_register_user_success(client, mocker):
    """Test luồng đăng ký thành công bằng cách mock kết quả trả về của Repository"""
    
    # 1. Giả lập Repo: Khi check email trùng, trả về None (Nghĩa là email chưa ai dùng)
    mocker.patch("repositories.user_repository.get_user_by_email", return_value=None)
    
    # 2. Giả lập Repo: Khi tạo user thành công, trả về một Object User giả có ID=1
    mock_user = models.User(
        id=1, 
        username="new_tester", 
        email="new_tester@example.com", 
        role="USER", 
        is_active=True
    )
    mocker.patch("repositories.user_repository.create_user", return_value=mock_user)

    # 3. Gọi API (Sẽ tự động thành /api/v1/auth/register nhờ conftest.py)
    response = client.post(
        "/auth/register",
        json={
            "username": "new_tester",
            "email": "new_tester@example.com",
            "password": "securepassword123"
        }
    )
    
    # 4. Kiểm tra kết quả
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["username"] == "new_tester"
    assert data["email"] == "new_tester@example.com"


def test_register_user_duplicate_email(client, mocker):
    """Test luồng chặn đăng ký trùng Email"""
    
    # 1. Giả lập Repo: Báo rằng Email này đã có một thằng User khác sử dụng rồi
    existing_user = models.User(id=99, email="duplicate@example.com")
    mocker.patch("repositories.user_repository.get_user_by_email", return_value=existing_user)
    
    # 2. Gọi API với email trùng
    response = client.post(
        "/auth/register",
        json={
            "username": "tester_dup",
            "email": "duplicate@example.com",
            "password": "password456"
        }
    )
    
    # 3. Kiểm tra kết quả bắt lỗi 400
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


# TEST: ĐĂNG NHẬP (LOGIN)
def test_login_success(client, mocker):
    """Test đăng nhập thành công"""
    mock_user = models.User(id=1, username="login_tester", email="login_tester@example.com", hashed_password="fake_hash", role="USER")
    mocker.patch("repositories.user_repository.get_user_by_email", return_value=mock_user)
    mocker.patch("auth.verify_password", return_value=True)
    response = client.post(
        "/auth/login",
        data={
            "username": "login_tester@example.com",
            "password": "correct_password"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, mocker):
    """Test đăng nhập sai mật khẩu"""
    
    mock_user = models.User(id=1, username="login_tester", email="login_tester@example.com", hashed_password="fake_hash", role="USER")
    mocker.patch("repositories.user_repository.get_user_by_email", return_value=mock_user)
    
    # 2. Giả lập Thư viện Auth: Báo rằng password KHÔNG KHỚP (False)
    mocker.patch("auth.verify_password", return_value=False)
    
    response = client.post(
        "/auth/login",
        data={
            "username": "login_tester@example.com",
            "password": "wrong_password"
        }
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Email or password is incorrect"

# TEST: ROLE & AUTH GUARD (GET /ME)
def test_get_me_success(client):
    """Test API lấy thông tin cá nhân (Mock luôn Dependency get_current_user)"""
    
    # 1. Giả lập "Lính gác cổng" (get_current_user) cho khách đi qua và trả về User giả
    def override_get_current_user():
        return models.User(id=1, username="me_tester", role="ADMIN", is_active=True)
    
    app.dependency_overrides[auth.get_current_user] = override_get_current_user
    
    # 2. Gọi API
    response = client.get("/auth/me")
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "me_tester"
    assert data["role"] == "ADMIN"
    
    # 3. Phục hồi lại "Lính gác cổng" như cũ
    app.dependency_overrides.pop(auth.get_current_user)


def test_get_me_unauthorized(client):
    """Test API chặn truy cập khi KHÔNG có Token"""
    
    response = client.get("/auth/me")
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"