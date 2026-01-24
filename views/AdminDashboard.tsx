
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PortalType, Rarity, Sticker, UserProfile } from '../types';
import { syncParashaWithChabad, generateParashaBannerAI, generateMeritBadge, generateStickerAI, generateQuestionBatch } from '../services/geminiService';
import { soundManager, SFX } from '../services/soundService';

type AdminTab = 'parasha' | 'merits' | 'stickers' | 'questions' | 'music' | 'supporters' | 'users';

interface AdminDashboardProps {
  onRefreshParasha: () => void;
  onRefreshMerits: () => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshParasha, onRefreshMerits, onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('parasha');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  
  // Modal State for Stickers
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [stickerForm, setStickerForm] = useState<{
    id?: string;
    name: string;
    description: string;
    image_url: string;
    rarity: Rarity;
  }>({
    name: '',
    description: '',
    image_url: '',
    rarity: Rarity.COMMON
  });

  // Modal State for Supporter Promotion
  const [showSupporterModal, setShowSupporterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [promotionTier, setPromotionTier] = useState('');

  const tabs: { id: AdminTab; icon: string; label: string; desc: string }[] = [
    { id: 'parasha', icon: '📜', label: 'Parashá', desc: 'Conteúdo semanal' },
    { id: 'merits', icon: '🏅', label: 'Méritos', desc: 'Sistema de conquistas' },
    { id: 'stickers', icon: '🃏', label: 'Figurinhas', desc: 'Colecionáveis' },
    { id: 'questions', icon: '❓', label: 'Perguntas', desc: 'Banco de questões' },
    { id: 'music', icon: '🎵', label: 'Músicas', desc: 'Playlist de nigunim' },
    { id: 'supporters', icon: '❤️', label: 'Apoiadores', desc: 'Doações e tiers' },
    { id: 'users', icon: '👥', label: 'Usuários', desc: 'Gestão de jogadores' },
  ];

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    let table = '';
    let query: any;
    
    switch (activeTab) {
      case 'parasha': table = 'parashiot'; break;
      case 'merits': table = 'merits'; break;
      case 'stickers': table = 'stickers'; break;
      case 'questions': table = 'pshat_questions'; break;
      case 'music': table = 'nigunim'; break;
      case 'supporters': table = 'profiles'; break; // Show profiles that are supporters
      case 'users': table = 'profiles'; break;
    }

    try {
      query = supabase.from(table).select('*');
      
      if (activeTab === 'supporters') {
        query = query.not('supporter_tier', 'is', null);
      }
      
      const { data: result } = await query.order('created_at', { ascending: false }).limit(50);
      setData(result || []);
    } catch (e) {
      console.error("Erro ao buscar dados da aba:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncParasha = async () => {
    setLoading(true);
    soundManager.play(SFX.PAPER);
    const parasha = await syncParashaWithChabad();
    if (parasha) {
      const banner = await generateParashaBannerAI(parasha.name_pt || "Parasha", parasha.summary || "");
      const payload = {
        ...parasha,
        banner_url: banner,
        is_current: true,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      await supabase.from('parashiot').update({ is_current: false }).neq('id', 'temp');
      await supabase.from('parashiot').insert(payload);
      alert("Parashá sincronizada e banner gerado com sucesso!");
      onRefreshParasha();
      fetchTabData();
    }
    setLoading(false);
  };

  const openPromotionModal = (user: any) => {
    setSelectedUser(user);
    setPromotionTier(user.supporter_tier || '');
    setShowSupporterModal(true);
  };

  const savePromotion = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        supporter_tier: promotionTier || null
      }).eq('id', selectedUser.id);
      
      if (error) throw error;
      alert("Status de apoiador atualizado!");
      setShowSupporterModal(false);
      fetchTabData();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar apoiador.");
    } finally {
      setLoading(false);
    }
  };

  // Sticker Actions
  const openCreateSticker = () => {
    setStickerForm({ name: '', description: '', image_url: '', rarity: Rarity.COMMON });
    setShowStickerModal(true);
  };

  const openEditSticker = (sticker: any) => {
    setStickerForm({
      id: sticker.id,
      name: sticker.name || '',
      description: sticker.description || '',
      image_url: sticker.image_url || '',
      rarity: (sticker.rarity as Rarity) || Rarity.COMMON
    });
    setShowStickerModal(true);
  };

  const handleAIStickerGeneration = async () => {
    if (!stickerForm.name) {
      alert("Por favor, digite um nome/tema para a figurinha primeiro.");
      return;
    }
    setLoading(true);
    try {
      const { frontUrl, description } = await generateStickerAI(stickerForm.name, stickerForm.rarity);
      setStickerForm(prev => ({ ...prev, image_url: frontUrl || prev.image_url, description: description || prev.description }));
      soundManager.play(SFX.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar com IA.");
    } finally {
      setLoading(false);
    }
  };

  const saveSticker = async () => {
    if (!stickerForm.name || !stickerForm.image_url) {
      alert("Nome e Link da Imagem são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: stickerForm.name,
        description: stickerForm.description,
        image_url: stickerForm.image_url,
        rarity: stickerForm.rarity
      };

      if (stickerForm.id) {
        const { error } = await supabase.from('stickers').update(payload).eq('id', stickerForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('stickers').insert(payload);
        if (error) throw error;
      }
      
      setShowStickerModal(false);
      fetchTabData();
      soundManager.play(SFX.SUCCESS);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar figurinha.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSticker = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta figurinha?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('stickers').delete().eq('id', id);
      if (error) throw error;
      fetchTabData();
      soundManager.play(SFX.CLICK);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar");
    } finally {
      setLoading(false);
    }
  };

  const renderParashaTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-yellow-500">Gestão de Parashá</h3>
        <Button variant="gold" onClick={handleSyncParasha} disabled={loading}>
          {loading ? <i className="fas fa-spinner animate-spin"></i> : '🔄 Sincronizar Chabad.org'}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data.map(p => (
          <Card key={p.id} className={`p-6 border-white/10 ${p.is_current ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
            <div className="flex gap-6">
              <img src={p.banner_url} className="w-48 h-24 object-cover rounded-xl" />
              <div>
                <h4 className="font-bold text-lg">{p.name_pt} ({p.name_he})</h4>
                <p className="text-xs text-white/40 line-clamp-2">{p.summary}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${p.is_current ? 'border-yellow-500 text-yellow-500' : 'border-white/10 text-white/20'}`}>
                    {p.is_current ? 'ATUAL' : 'PASSADA'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMeritsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-purple-400">Galeria de Méritos</h3>
        <Button variant="outline" onClick={() => alert("Criar novo mérito...")}>➕ Novo Mérito</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex flex-col items-center text-center space-y-3">
            <img src={m.image_url} className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/20" />
            <p className="text-xs font-bold truncate w-full">{m.name}</p>
            <div className="flex gap-1">
              <button className="text-[10px] text-blue-400 hover:underline">Edit</button>
              <button className="text-[10px] text-red-400 hover:underline">Del</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStickersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-blue-400">Catálogo de Figurinhas</h3>
        <Button variant="gold" onClick={openCreateSticker}>✨ Criar Nova Figurinha</Button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <button 
          onClick={openCreateSticker}
          className="aspect-[3/4] glass rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 hover:bg-white/5 transition-all text-white/30 hover:text-yellow-500 group"
        >
          <i className="fas fa-plus text-2xl group-hover:scale-110 transition-transform"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
        </button>

        {data.map(s => (
          <div key={s.id} className="relative group">
            <Card className="aspect-[3/4] p-1 border-white/10 overflow-hidden bg-slate-900 shadow-xl">
               <img src={s.image_url} className="w-full h-full object-cover rounded-lg" />
            </Card>
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
               <button 
                onClick={() => openEditSticker(s)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-yellow-500/20 hover:text-yellow-500 flex items-center justify-center transition-all"
               >
                 <i className="fas fa-edit text-xs"></i>
               </button>
               <button 
                onClick={() => handleDeleteSticker(s.id)}
                className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all"
               >
                 <i className="fas fa-trash text-xs"></i>
               </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
              <p className="text-[8px] font-bold truncate bg-black/60 rounded px-1">{s.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* STICKER MODAL */}
      {showStickerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-xl p-8 border-white/10 bg-slate-900 shadow-2xl relative">
            <button onClick={() => setShowStickerModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
            
            <h3 className="font-cinzel text-xl text-yellow-500 mb-6 uppercase tracking-widest">
              {stickerForm.id ? 'Editar Figurinha' : 'Nova Figurinha'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-black">Nome / Tema</label>
                  <input 
                    type="text" 
                    value={stickerForm.name}
                    onChange={(e) => setStickerForm({...stickerForm, name: e.target.value})}
                    placeholder="Ex: Tábua dos Mandamentos"
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-yellow-500/50 outline-none text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-black">Raridade</label>
                  <select 
                    value={stickerForm.rarity}
                    onChange={(e) => setStickerForm({...stickerForm, rarity: e.target.value as Rarity})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-yellow-500/50 outline-none text-sm text-white"
                  >
                    {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-black">Descrição</label>
                  <textarea 
                    value={stickerForm.description}
                    onChange={(e) => setStickerForm({...stickerForm, description: e.target.value})}
                    rows={3}
                    placeholder="Descrição mística..."
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-yellow-500/50 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-black">Link da Imagem</label>
                  <input 
                    type="text" 
                    value={stickerForm.image_url}
                    onChange={(e) => setStickerForm({...stickerForm, image_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-yellow-500/50 outline-none text-[10px]"
                  />
                </div>

                <div className="aspect-[3/4] bg-black/60 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                  {stickerForm.image_url ? (
                    <img src={stickerForm.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-image text-white/10 text-4xl"></i>
                  )}
                </div>

                <Button variant="outline" className="w-full py-2 text-xs" onClick={handleAIStickerGeneration} disabled={loading}>
                  {loading ? <i className="fas fa-spinner animate-spin"></i> : <><i className="fas fa-magic mr-2"></i> Gerar com IA</>}
                </Button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowStickerModal(false)}>Cancelar</Button>
              <Button variant="gold" className="flex-[2]" onClick={saveSticker} disabled={loading}>
                {loading ? 'Salvando...' : stickerForm.id ? 'Salvar Edição' : 'Criar Figurinha'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-green-400">Banco de Questões</h3>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs">Exportar CSV</Button>
          <Button variant="gold" className="text-xs">⚡ Gerar 50 com IA</Button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(q => (
          <Card key={q.id} className="p-4 flex items-center justify-between border-white/5 hover:border-white/10">
             <div className="flex-1">
               <p className="text-sm font-medium">{q.text}</p>
               <p className="text-[9px] text-white/30 uppercase mt-1">Dificuldade: {q.difficulty} • XP: {q.xp_reward}</p>
             </div>
             <i className="fas fa-chevron-right text-white/10"></i>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMusicTab = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-pink-500">Nigunim e Trilhas</h3>
        <Button variant="outline">📤 Upload MP3</Button>
      </div>
      <div className="space-y-2">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <i className="fas fa-play text-xs text-pink-400"></i>
              </div>
              <div>
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-[10px] text-white/30 uppercase">{m.category}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className={`w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <button className="text-white/20 hover:text-white"><i className="fas fa-ellipsis-v"></i></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSupportersTab = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-red-500">Mural de Apoiadores</h3>
        <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
          <span className="text-xs text-red-400 uppercase font-bold tracking-widest">Base de Benfeitores Ativos</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(s => (
          <Card key={s.id} className="p-4 border-white/5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rotate-45 translate-x-8 -translate-y-8"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 p-0.5 overflow-hidden">
                <img src={s.avatar_url || 'https://i.pravatar.cc/150'} className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <p className="text-sm font-bold">{s.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                   <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">{s.supporter_tier}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] uppercase font-bold tracking-widest">Nível {s.level}</span>
               <button onClick={() => openPromotionModal(s)} className="text-[9px] text-blue-400 font-bold uppercase tracking-widest hover:underline">Alterar Nível</button>
            </div>
          </Card>
        ))}
        {data.length === 0 && <p className="col-span-full text-center py-12 text-white/20 uppercase text-xs">Nenhum apoiador registrado ainda</p>}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-sky-400">Base de Jogadores</h3>
        <input type="text" placeholder="Buscar por nome ou e-mail..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-sky-500/50" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase text-white/30 border-b border-white/5">
              <th className="pb-4 pl-4">Jogador</th>
              <th className="pb-4">Nível</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Apoio</th>
              <th className="pb-4 pr-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map(u => (
              <tr key={u.id} className="group hover:bg-white/[0.02]">
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar_url} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="py-4 text-sm">{u.level}</td>
                <td className="py-4">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Ativo</span>
                </td>
                <td className="py-4">
                  {u.supporter_tier ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase tracking-widest">
                       {u.supporter_tier}
                    </span>
                  ) : (
                    <span className="text-[9px] text-white/10 uppercase tracking-widest font-bold">Jogador</span>
                  )}
                </td>
                <td className="py-4 pr-4 text-right">
                   <button onClick={() => openPromotionModal(u)} className="text-white/20 hover:text-yellow-500 mr-3 transition-colors">
                     <i className="fas fa-award text-xs"></i>
                   </button>
                   <button className="text-white/20 hover:text-white mr-3"><i className="fas fa-cog text-xs"></i></button>
                   <button className="text-white/20 hover:text-red-500"><i className="fas fa-ban text-xs"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROMOTION MODAL */}
      {showSupporterModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-sm p-8 border-white/10 bg-slate-900 shadow-2xl relative">
            <button onClick={() => setShowSupporterModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <i className="fas fa-times"></i>
            </button>
            <h3 className="font-cinzel text-xl text-yellow-500 mb-6 uppercase tracking-widest">Promover Apoiador</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                <img src={selectedUser?.avatar_url} className="w-12 h-12 rounded-full" />
                <div>
                   <p className="text-sm font-bold">{selectedUser?.name}</p>
                   <p className="text-[10px] text-white/40 uppercase">Nível {selectedUser?.level}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-black">Nível de Apoio</label>
                <select 
                  value={promotionTier}
                  onChange={(e) => setPromotionTier(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-yellow-500/50 outline-none text-white text-sm"
                >
                  <option value="">Nenhum (Jogador comum)</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                  <option value="Diamante">Diamante</option>
                  <option value="Benfeitor">Benfeitor</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowSupporterModal(false)}>Cancelar</Button>
                <Button variant="gold" className="flex-[2]" onClick={savePromotion} disabled={loading}>
                   {loading ? 'Salvando...' : 'Confirmar Apoio'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-slate-950/50 flex flex-col flex-shrink-0">
        <div className="p-8 border-b border-white/5 mb-4">
          <h2 className="font-cinzel text-lg font-bold text-yellow-500 tracking-tighter">ADMIN PANEL</h2>
          <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-1">PaRDeS v3.0 Control</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
              <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{tab.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest leading-none">{tab.label}</p>
                <p className="text-[9px] opacity-50 mt-1">{tab.desc}</p>
              </div>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={onClose} className="w-full py-3 glass rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            <i className="fas fa-door-open mr-2"></i> Sair do Painel
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">Servidores Online • Latência 24ms</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
           {loading && !showStickerModal && !showSupporterModal && (
             <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                <p className="text-[10px] uppercase tracking-widest font-black text-yellow-500 animate-pulse">Invocando Dados...</p>
             </div>
           )}

           <div className="max-w-6xl mx-auto pb-24">
              {activeTab === 'parasha' && renderParashaTab()}
              {activeTab === 'merits' && renderMeritsTab()}
              {activeTab === 'stickers' && renderStickersTab()}
              {activeTab === 'questions' && renderQuestionsTab()}
              {activeTab === 'music' && renderMusicTab()}
              {activeTab === 'supporters' && renderSupportersTab()}
              {activeTab === 'users' && renderUsersTab()}
           </div>
        </div>

        <footer className="absolute bottom-0 inset-x-0 p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center z-10">
          <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-black">© 2025 Portões do PaRDeS Administrative Suite</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
