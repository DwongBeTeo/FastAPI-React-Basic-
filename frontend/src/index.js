import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './style.css';
import React from 'react';
// import TestDate from './TestDate';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const root = createRoot(document.getElementById('root'));
root.render(
<BrowserRouter>
   <AuthProvider>
      {/* <CartProvider> */}
        <App />
      {/* </CartProvider> */}
   </AuthProvider>
</BrowserRouter>
);