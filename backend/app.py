import dash
from dash import html, dcc, Input, Output, State, callback
import requests

app = dash.Dash(__name__)

# Địa chỉ Backend FastAPI của bạn
API_URL = "http://localhost:8000/api/v1" 

# 1. LAYOUT (GIAO DIỆN)
app.layout = html.Div(style={"fontFamily": "Arial", "maxWidth": "800px", "margin": "0 auto"}, children=[
    html.H2("Quản lý Sản phẩm (Dash Frontend)"),
    
    # Nơi hiển thị thông báo lỗi/thành công
    html.Div(id="thong-bao", style={"color": "blue", "fontWeight": "bold", "marginBottom": "15px"}),

    # --- FORM TẠO SẢN PHẨM ---
    html.Div(style={"border": "1px solid #ccc", "padding": "20px", "borderRadius": "8px"}, children=[
        html.H4("Thêm mới sản phẩm"),
        # Tương đương thẻ <input> trong React
        dcc.Input(id="input-name", type="text", placeholder="VD: Cá Koi Kohaku, Bể kính...", style={"marginRight": "10px", "padding": "8px", "width": "200px"}),
        dcc.Input(id="input-price", type="number", placeholder="Giá (VNĐ)", style={"marginRight": "10px", "padding": "8px"}),
        
        # Tương đương thẻ <button onClick={...}>
        html.Button("Lưu Sản Phẩm", id="btn-create", n_clicks=0, style={"padding": "8px 15px", "backgroundColor": "#4ade80", "border": "none", "cursor": "pointer"})
    ]),

    html.Hr(),

    # --- List Product ---
    html.Div([
        html.H4("Danh sách hiện tại"),
        html.Button("Làm mới dữ liệu", id="btn-refresh", n_clicks=0, style={"marginBottom": "10px", "padding": "5px 10px"}),
        
        # Cái khung trống này sẽ được Máy chủ Python "bơm" mã HTML của cái bảng vào sau khi gọi API
        html.Div(id="bang-san-pham")
    ])
])

# 2. CALLBACKS (LOGIC XỬ LÝ) - Thay thế cho React State & Axios

# --- Xử lý sự kiện Tạo Sản Phẩm ---
@app.callback(
    Output("thong-bao", "children"),  # Gửi kết quả ra cái Div thông báo
    Input("btn-create", "n_clicks"),  # Lắng nghe sự kiện Click
    State("input-name", "value"),     # Lấy giá trị từ ô Input Tên
    State("input-price", "value"),    # Lấy giá trị từ ô Input Giá
    prevent_initial_call=True
)
def handle_create_product(n_clicks, name, price):
    if not name or price is None:
        return "Vui lòng nhập đầy đủ Tên và Giá!"

    # Đóng gói dữ liệu gửi lên FastAPI
    payload = {
        "name": name,
        "price": price,
        "is_active": True
    }
    
    try:
        # LƯU Ý: Nếu API tạo sản phẩm vẫn yêu cầu quyền Admin, 
        # lệnh POST này có thể vẫn trả về lỗi 401/403.
        response = requests.post(f"{API_URL}/admin/products", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            return f"Tạo thành công! Sản phẩm: {data['name']} - Mã tự sinh: {data['code']}"
        else:
            return f"Lỗi từ Backend: {response.text}"
            
    except Exception as e:
        return f"Không thể kết nối đến FastAPI: {str(e)}"


# --- Xử lý sự kiện Hiển thị Bảng ---
@app.callback(
    Output("bang-san-pham", "children"),
    Input("btn-refresh", "n_clicks"),
    Input("thong-bao", "children") 
)
def load_products(n_clicks, thong_bao):
    try:
        # http://127.0.0.1:8050/products/skip=0&limit=10
        response = requests.get(f"{API_URL}/products?skip=0&limit=5")
        
        if response.status_code == 200:
            products = response.json().get("data", [])
            
            if not products:
                return "Chưa có dữ liệu."

            # Dùng Python để "vẽ" ra các thẻ HTML <tr>, <td> cho cái bảng
            rows = []
            for p in products:
                rows.append(html.Tr([
                    html.Td(p['code'], style={"border": "1px solid #ddd", "padding": "8px"}),
                    html.Td(p['name'], style={"border": "1px solid #ddd", "padding": "8px"}),
                    html.Td(f"{p['price']} VNĐ", style={"border": "1px solid #ddd", "padding": "8px"})
                ]))
                
            return html.Table([
                html.Thead(html.Tr([
                    html.Th("Mã", style={"border": "1px solid #ddd", "padding": "8px", "backgroundColor": "#f2f2f2"}), 
                    html.Th("Tên", style={"border": "1px solid #ddd", "padding": "8px", "backgroundColor": "#f2f2f2"}), 
                    html.Th("Giá", style={"border": "1px solid #ddd", "padding": "8px", "backgroundColor": "#f2f2f2"})
                ])),
                html.Tbody(rows)
            ], style={"width": "100%", "borderCollapse": "collapse"})
            
        return f"Lỗi khi tải danh sách từ Backend (Code: {response.status_code})."
    except Exception:
        return "Backend FastAPI chưa được bật hoặc từ chối kết nối!"

# Chạy server
if __name__ == "__main__":
    app.run(debug=True, port=8050)