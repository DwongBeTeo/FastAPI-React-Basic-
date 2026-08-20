# 1. Chọn base image Node.js bản nhẹ (Alpine)
FROM node:21.7.1-alpine

# 2. Thiết lập thư mục làm việc trong container
WORKDIR /app

# 3. Copy các file quản lý thư viện vào trước để tận dụng cache của Docker
COPY package.json package-lock.json* ./

# 4. Cài đặt các thư viện (node_modules)
RUN npm install

# 5. Copy toàn bộ các file cấu hình và source code vào container
COPY . .

# 6. Mở cổng 3000 để map ra bên ngoài
EXPOSE 3000

# 7. Lệnh khởi chạy server development của Webpack
CMD ["npm", "start"]