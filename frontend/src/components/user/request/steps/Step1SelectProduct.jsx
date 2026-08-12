// src/components/user/request/steps/Step1SelectProduct.jsx
import React from 'react';
import { Info } from 'lucide-react';

const Step1SelectProduct = ({ 
    products, 
    pendingProductIds, 
    activeAccessMap, 
    cartItems, 
    handleAddToCart, 
    handleRemoveFromCart 
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.map(product => {
                const isPending = pendingProductIds.has(product.id);
                const activeAcc = activeAccessMap.get(product.id);
                const inCart = cartItems.some(i => i.product_id === product.id);

                return (
                    <div key={product.id} className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        inCart ? 'border-[#4ade80] bg-[#4ade80]/5' : 'border-slate-800 bg-[#111827]'
                    }`}>
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-xs font-mono text-slate-500 mb-1">{product.code}</p>
                                    <h3 className="font-bold text-lg text-white">{product.name}</h3>
                                </div>
                                <span className="text-xs font-bold text-[#4ade80] bg-[#064e3b]/40 border border-[#064e3b] px-3 py-1.5 rounded uppercase tracking-wider">
                                    ${product.price?.toLocaleString('en-US') || 0}/mo
                                </span>
                            </div>

                            {(product.available_from || product.available_to) && (
                                <p className="text-sm text-slate-400 mb-3">
                                    Data range: {product.available_from ? product.available_from.substring(0, 7) : 'Any'} ➔ {product.available_to ? product.available_to.substring(0, 7) : 'Now'}
                                </p>
                            )}

                            {activeAcc && (
                                <div className="mb-3 text-[12px] text-[#4ade80] bg-[#064e3b]/30 border border-[#064e3b] px-3 py-2 rounded flex items-center gap-2">
                                    <Info size={14}/> Access granted: {new Date(activeAcc.expires_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        {isPending ? (
                            <div className="mt-4 w-full text-center py-2.5 bg-slate-800/50 border border-slate-700 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed">
                                Pending Review
                            </div>
                        ) : (
                            <button 
                                onClick={() => inCart ? handleRemoveFromCart(product.id) : handleAddToCart(product)}
                                className={`mt-4 w-full py-2.5 rounded-lg text-sm font-bold transition-colors ${
                                    inCart 
                                    ? 'bg-[#4ade80] text-slate-900 hover:bg-[#22c55e]' 
                                    : 'bg-transparent border border-slate-700 text-[#4ade80] hover:border-[#4ade80]'
                                }`}
                            >
                                {inCart ? 'Selected' : 'Select'}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Step1SelectProduct;