import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div>
            {/* Thanh Menu điều hướng */}
            <nav style={{ padding: '15px', background: '#2c3e50', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.2rem', marginRight: '20px' }}>Pet</strong>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link>
                <Link to="/productAdmin" style={{ color: 'white', textDecoration: 'none' }}>Quản lý Pet</Link>
                <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Đăng nhập</Link>
            </nav>
            
            {/* Phần nội dung của từng trang sẽ được nhúng vào đây */}
            <main style={{ padding: '20px', minHeight: '80vh' }}>
                <Outlet /> 
            </main>
            
            <footer style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', color: '#6c757d' }}>
                Cửa hàng Pet
            </footer>
        </div>
    );
}