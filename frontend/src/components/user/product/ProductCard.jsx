// src/components/user/product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onBuyClick }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full p-5">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Package size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.is_active ? 'For sale' : 'Sold out'}
                </span>
            </div>

            <div className="flex flex-col flex-1">
                <p className="text-xs text-gray-400 font-mono mb-1">{product.code}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{product.name}</h3>
                
                <p className="text-xl font-bold text-blue-600 mt-auto pt-4 flex items-end gap-1">
                    Starts from: ${product.price ? product.price.toLocaleString('en-US') : '0'} 
                    <span className="text-sm font-normal text-gray-500 mb-0.5">/ month</span>
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Link 
                        to={`/products/${product.id}`} 
                        className="flex-1 flex items-center justify-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                    >
                        Detail
                    </Link>
                    <button 
                        onClick={() => onBuyClick(product)} 
                        disabled={!product.is_active}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={16} /> Buy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;