
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { soundManager, SFX } from '../services/soundService';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  color: string;
}

interface ShopViewProps {
  user: UserProfile;
  onClose: () => void;
  onPurchaseHeart: () => void;
  onSpendSparks: (amount: number) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ user, onClose, onPurchaseHeart, onSpendSparks }) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('cost', { ascending: true });
      
      if (error) throw error;
      if (data) setItems(data);
    } catch (err) {
      console.error("Erro ao carregar loja:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (item: ShopItem) => {
    if (user.sparks < item.cost) {
      soundManager.play(SFX.ERROR);
      alert("Centelhas insuficientes para esta compra!");
      return;
    }

    soundManager.play(SFX.SUCCESS);
    onSpendSparks(item.cost);
    
    // Lógica específica baseada no ícone ou nome
    if (item.name.toLowerCase().includes('vida') || item.icon.includes('heart')) {
      onPurchaseHeart();
      alert("Vida extra adquirida com sucesso! ❤️");
    } else {
      alert(`Você adquiriu ${item.name}! O efeito será aplicado na sua próxima jornada.`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <header className="p-8 lg:px-12 bg-slate-900/50 border-b border-white/5 flex items-center justify-between flex-shrink-0 relative z-10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 glass rounded-xl hover:bg-white/10 transition-colors">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="font-cinzel text-3xl tracking-widest text-yellow-500">Loja de Centelhas</h2>
            <div className="flex items-center gap-4 mt-1">
               <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  <i className="fas fa-bolt text-yellow-500 text-xs"></i>
                  <span className="text-sm font-bold text-yellow-400">{user.sparks} Centelhas</span>
               </div>
               <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] hidden sm:block">Apoio espiritual para sua jornada</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
        {/* Background Decorativo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold animate-pulse">Consultando Mercado...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
            {items.map((item) => (
              <Card key={item.id} className="p-10 flex flex-col items-center text-center space-y-8 hover:border-yellow-500/40 transition-all group bg-slate-900/40 backdrop-blur-xl">
                <div className={`w-24 h-24 rounded-[2rem] glass flex items-center justify-center text-5xl ${item.color} group-hover:scale-110 transition-all duration-500 shadow-xl border-white/5`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-yellow-500 transition-colors">{item.name}</h3>
                  <p className="text-sm text-white/40 leading-relaxed min-h-[3rem] font-medium">{item.description}</p>
                </div>

                <div className="w-full pt-6 space-y-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black mb-1">Preço da Oferta</span>
                    <div className="text-3xl font-cinzel text-yellow-500 font-bold flex items-center gap-2">
                       <i className="fas fa-bolt text-xs opacity-50"></i>
                       {item.cost}
                    </div>
                  </div>
                  
                  <Button 
                    variant={user.sparks >= item.cost ? "gold" : "outline"} 
                    className="w-full py-5 rounded-2xl" 
                    onClick={() => handlePurchase(item)}
                    disabled={user.sparks < item.cost}
                  >
                    {user.sparks >= item.cost ? "ADQUIRIR" : "FALTAM CENTELHAS"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <i className="fas fa-store-slash text-7xl mb-6"></i>
            <p className="uppercase tracking-[0.5em] text-sm font-bold">Mercado Fechado Temporariamente</p>
          </div>
        )}
      </div>

      <footer className="p-8 bg-slate-950/80 border-t border-white/5 text-center backdrop-blur-md">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.8em] font-black">PaRDeS Sacred Marketplace • Est. 5785</p>
      </footer>
    </div>
  );
};

export default ShopView;
