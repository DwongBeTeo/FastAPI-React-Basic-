import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import ProductAdmin from './pages/admin/ProductAdmin';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Warp in MainLayout*/}
      <Route element={<MainLayout />}>
        
        {/* Trang ai cũng vào được */}
        <Route path="/" element={<Home />} />

        {/* For only ADMIN */}
            <Route path="/productAdmin" element={<ProductAdmin />} /> 
        {/* <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        </Route> */}

      </Route>
    </Routes>
  );
};
export default App;