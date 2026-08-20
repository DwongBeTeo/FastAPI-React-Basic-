# 1. Base image  Python 3.13
FROM python:3.13.2-slim

# 2. Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# 3. Cài đặt các công cụ hệ thống cần thiết và Poetry
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir poetry

# 4. Cấu hình Poetry không tạo môi trường ảo (virtualenv) bên trong Docker
RUN poetry config virtualenvs.create false
# 5. Copy 2 file quản lý thư viện vào trước (để tối ưu tốc độ build của Docker)
COPY pyproject.toml poetry.lock ./

# 6. Cài đặt các thư viện vào hệ thống
RUN poetry install --no-root

# 7. Copy toàn bộ mã nguồn từ máy bạn vào trong Docker
COPY . .

# 8. Mở cổng 8000 để bên ngoài có thể gọi vào API
EXPOSE 8000

# 9. Lệnh để chạy ứng dụng 
#  --reload làm tốn tài nguyên và khi sang máy người khác thay bằng --host 0.0.0.0
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]