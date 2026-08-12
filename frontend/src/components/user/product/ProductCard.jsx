// src/components/user/product/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onBuyClick }) => {
    return (
        <div className="bg-[#102034] rounded-xl shadow-sm border border-[#26364a] overflow-hidden hover:border-[#45464d] transition-all flex flex-col h-full p-5 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#0f172a] rounded-lg text-[#4edea3]">
                    <Package size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${product.is_active ? 'bg-[#00a572]/20 text-[#4edea3]' : 'bg-[#93000a]/30 text-[#ffb4ab]'}`}>
                    {product.is_active ? 'For sale' : 'Sold out'}
                </span>
            </div>
            <div className="flex flex-col flex-1">
                <p className="text-xs text-[#909097] font-mono mb-1">{product.code}</p>
                <h3 className="text-lg font-bold text-[#d3e4fe] mb-2 leading-tight font-['Geist']">{product.name}</h3>
                
                <p className="text-xl font-bold text-[#d3e4fe] mt-auto pt-4 flex items-end gap-1 font-['Geist']">
                    Starts from: ${product.price ? product.price.toLocaleString('en-US') : '0'} 
                    <span className="text-sm font-normal text-[#909097] mb-0.5">/ month</span>
                </p>
                <div className="mt-4 pt-4 border-t border-[#26364a] flex gap-2">
                    <Link 
                        to={`/products/${product.id}`} 
                        className="flex-1 flex items-center justify-center py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] text-sm font-semibold rounded-lg transition-colors border border-[#26364a]"
                    >
                        Detail
                    </Link>
                    <button 
                        onClick={() => onBuyClick(product)} 
                        disabled={!product.is_active}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart size={16} /> Buy
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ProductCard;