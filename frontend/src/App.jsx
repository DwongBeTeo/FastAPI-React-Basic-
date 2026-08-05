import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import PetAdmin from './pages/admin/PetAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import PetListPage from './pages/user/PetListPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Warp in MainLayout*/}
      <Route element={<MainLayout />}>
        
        {/* for everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/pets" element={<PetListPage />} />

        {/* For only ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/pets" element={<PetAdmin />} /> 
        </Route>
        {/* <Route element={<ProtectedRoute allowedRoles={['ADMIN']}/>}></Route> */}

      </Route>
    </Routes>
  );
};
export default App;