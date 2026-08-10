import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import ProductListPage from './pages/user/product/ProductListPage';
import ProductAdmin from './pages/admin/ProductAdmin'
import RequestAdminPage from './pages/admin/request/RequestAdminPage';
import ActualDataPage from './pages/user/access/ActualDataPage';
import Register from './pages/Register';
import ProductDataAdmin from './pages/admin/ProductDataAdmin';
import UserDashboardPage from './pages/user/access/UserDashboardPage';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="not-found" element={<NotFound />} />

      {/* Wrap in MainLayout */}
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListPage />} />
        {/* <Route path="/products/:id" element={<ProductDetailPage />} /> */}

        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/my-dashboard" element={<UserDashboardPage />} />
          <Route path="/my-data/:productId" element={<ActualDataPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/products" element={<ProductAdmin />} /> 
            <Route path="/admin/requests" element={<RequestAdminPage />} />
            <Route path="/admin/product-data" element={<ProductDataAdmin />} />
        </Route>

      </Route>
    </Routes>
  );
};
export default App;