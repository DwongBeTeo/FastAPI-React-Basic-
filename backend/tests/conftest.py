import pytest
from fastapi.testclient import TestClient
from main import app

class PrefixedTestClient(TestClient):
    """Custom TestClient tự động cộng thêm tiền tố /api/v1 vào mọi request"""
    def request(self, method, url, *args, **kwargs):
        # Nếu URL chưa bắt đầu bằng /api/v1 và không phải là http thì tự động thêm vào
        if not url.startswith("/api/v1") and not url.startswith("http"):
            url = f"/api/v1{url if url.startswith('/') else '/' + url}"
        return super().request(method, url, *args, **kwargs)

@pytest.fixture(scope="session")
def client():
    return PrefixedTestClient(app)