
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Verifique seu e-mail para confirmar o cadastro!");
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Background Decorativo */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-yellow-500/10 to-transparent blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10 space-y-4">
          <h1 className="font-cinzel text-4xl font-black text-yellow-500 tracking-widest drop-shadow-[0_0_20px_rgba(234,179,8,0.4)] uppercase">
            Portões do PaRDeS
          </h1>
          <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold">Inicie sua jornada mística</p>
        </div>

        <Card className="p-8 lg:p-10 border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-2xl relative">
          <div className="flex mb-8 p-1 bg-black/40 rounded-2xl border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isLogin ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${!isLogin ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">E-mail</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-xl focus:border-yellow-500/50 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-2">Senha</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 p-4 pl-12 rounded-xl focus:border-yellow-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-shake">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            <Button 
              variant="gold" 
              className="w-full py-5 text-lg shadow-[0_15px_30px_rgba(234,179,8,0.2)]"
              disabled={loading}
            >
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : (isLogin ? 'Entrar' : 'Cadastrar')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
              Ao entrar, você concorda em respeitar a sagrada tradição e os termos da comunidade.
            </p>
          </div>
        </Card>

        {/* Decorativo Inferior */}
        <div className="mt-12 flex items-center justify-center space-x-4 opacity-10">
          <div className="h-[1px] w-12 bg-white"></div>
          <div className="h-[1px] w-12 bg-white"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
