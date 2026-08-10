// import { createContext, useState } from "react";


// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//     const [cart, setCart] = useState([]);

//     const addToCart = (product) => {
//         setCart(prevCart => {
//             const exists = prevCart.find(item => item.id === product.id);
//             if (exists) {
//                 return prevCart;
//             }
//             return [...prevCart, product];
//         });
//     };

//     return (
//         <CartContext.Provider value={{ cart, addToCart }}>
//             {children}
//         </CartContext.Provider>
//     );
// };