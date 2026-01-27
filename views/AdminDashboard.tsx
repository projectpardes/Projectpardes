
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
  
  // Helper para formatar data para o input date (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

  // Parasha Modal State - CAMPOS EXATOS DO BANCO DE DADOS
  const [showParashaModal, setShowParashaModal] = useState(false);
  const [parashaForm, setParashaForm] = useState({
    id: '',
    name_pt: '',
    name_he: '',
    summary: '',
    banner_url: '',
    start_date: formatDateForInput(new Date()),
    end_date: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  });

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
    
    switch (activeTab) {
      case 'parasha': table = 'parashiot'; break;
      case 'merits': table = 'merits'; break;
      case 'stickers': table = 'stickers'; break;
      case 'questions': table = 'pshat_questions'; break;
      case 'music': table = 'nigunim'; break;
      case 'supporters': table = 'profiles'; break;
      case 'users': table = 'profiles'; break;
    }

    try {
      let query = supabase.from(table).select('*');
      
      if (activeTab === 'supporters') {
        query = query.not('supporter_tier', 'is', null);
      }
      
      const { data: result, error } = await query.order('created_at', { ascending: false }).limit(50);
      
      if (error) throw error;
      setData(result || []);
    } catch (e: any) {
      console.error("Erro ao buscar dados da aba:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncParashaToForm = async () => {
    setLoading(true);
    soundManager.play(SFX.PAPER);
    try {
      const parasha = await syncParashaWithChabad();
      if (!parasha || !parasha.name_pt) throw new Error("Dados não encontrados no Chabad.org");

      setParashaForm(prev => ({
        ...prev,
        name_pt: parasha.name_pt || prev.name_pt,
        name_he: parasha.name_he || prev.name_he,
        summary: parasha.summary || prev.summary,
        banner_url: parasha.banner_url || prev.banner_url
      }));

      soundManager.play(SFX.SUCCESS);
    } catch (error: any) {
      alert("Erro ao sincronizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualParashaSave = async () => {
    if (!parashaForm.name_pt) return alert("Nome é obrigatório.");
    if (!parashaForm.start_date || !parashaForm.end_date) return alert("Datas são obrigatórias.");

    setLoading(true);
    try {
      const { data: existing, error: checkError } = await supabase
        .from('parashiot')
        .select('id')
        .eq('name_pt', parashaForm.name_pt)
        .maybeSingle();
      
      if (checkError) throw checkError;

      // Payload espelhando EXATAMENTE as colunas reais do banco
      const payload: any = {
        name_pt: parashaForm.name_pt,
        name_he: parashaForm.name_he,
        summary: parashaForm.summary,
        banner_url: parashaForm.banner_url,
        start_date: new Date(parashaForm.start_date).toISOString(),
        end_date: new Date(parashaForm.end_date).toISOString(),
        is_current: false
      };

      let result;
      if (existing) {
        result = await supabase.from('parashiot').update(payload).eq('id', existing.id);
      } else {
        result = await supabase.from('parashiot').insert(payload);
      }

      if (result.error) throw result.error;

      setShowParashaModal(false);
      soundManager.play(SFX.SUCCESS);
      await fetchTabData(); 
      onRefreshParasha(); 
      alert(`Parashá "${parashaForm.name_pt}" salva com sucesso!`);
    } catch (e: any) {
      console.error("Erro ao salvar Parashá:", e);
      alert(`Erro no Banco de Dados: ${e.message}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentParasha = async (id: string) => {
    setLoading(true);
    try {
      await supabase.from('parashiot').update({ is_current: false }).eq('is_current', true);
      await supabase.from('parashiot').update({ is_current: true }).eq('id', id);
      await fetchTabData();
      onRefreshParasha();
      soundManager.play(SFX.SUCCESS);
      alert("Parashá atualizada com sucesso!");
    } catch (e: any) {
      console.error(e);
      alert(`Erro ao atualizar status: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateManualBanner = async () => {
    if (!parashaForm.name_pt) return alert("Digite o nome da Parashá primeiro.");
    setLoading(true);
    try {
      const banner = await generateParashaBannerAI(parashaForm.name_pt, parashaForm.summary);
      if (banner) setParashaForm(prev => ({ ...prev, banner_url: banner }));
    } catch (e) {
      alert("Erro ao gerar banner.");
    } finally {
      setLoading(false);
    }
  };

  const renderParashaTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-yellow-500">Gestão de Parashá</h3>
        <div className="flex gap-2">
          <Button variant="gold" onClick={() => {
            setParashaForm({ 
              id: '', 
              name_pt: '', 
              name_he: '', 
              summary: '', 
              banner_url: '',
              start_date: formatDateForInput(new Date()),
              end_date: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            });
            setShowParashaModal(true);
          }}>➕ Criar Manualmente</Button>
        </div>
      </div>
      
      {data.length === 0 && !loading && (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
          <i className="fas fa-scroll text-4xl text-white/10 mb-4"></i>
          <p className="text-white/40 uppercase tracking-widest text-xs">Nenhuma parashá encontrada na tabela 'parashiot'</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {data.map(p => (
          <Card key={p.id} className={`p-6 border-white/10 ${p.is_current ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6">
              <img src={p.banner_url || 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400'} className="w-full md:w-48 h-32 md:h-24 object-cover rounded-xl shadow-lg bg-slate-800" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{p.name_pt}</h4>
                      <span className="text-yellow-500 font-cinzel text-sm">{p.name_he}</span>
                   </div>
                   {!p.is_current && (
                     <Button 
                       variant="outline" 
                       className="text-[9px] py-1 px-3 h-fit border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                       onClick={() => handleSetCurrentParasha(p.id)}
                     >
                       Tornar Atual
                     </Button>
                   )}
                </div>
                <p className="text-xs text-white/40 line-clamp-2 italic">{p.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${p.is_current ? 'border-yellow-500 text-yellow-500 font-bold' : 'border-white/10 text-white/20'}`}>
                    {p.is_current ? '📍 ATUAL' : 'PASSADA'}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest">
                    {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-green-400">Banco de Questões</h3>
        <Button variant="gold" onClick={() => alert("Gerar com IA...")}>⚡ Gerar Novas</Button>
      </div>
      <div className="space-y-2">
        {data.map(q => (
          <Card key={q.id} className="p-4 border-white/5 flex justify-between items-center">
             <p className="text-sm font-medium line-clamp-1">{q.text}</p>
             <i className="fas fa-edit text-white/20 hover:text-white cursor-pointer"></i>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <i className="fas fa-music"></i>
              </div>
              <div>
                <p className="text-sm font-bold">{m.name}</p>
                <p className="text-[10px] text-white/30 uppercase">{m.category}</p>
              </div>
            </div>
            <button className="text-white/20 hover:text-white"><i className="fas fa-trash"></i></button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSupportersTab = () => (
    <div className="space-y-6">
      <h3 className="font-cinzel text-xl text-red-500">Mural de Apoiadores</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map(s => (
          <Card key={s.id} className="p-4 flex items-center gap-4">
            <img src={s.avatar_url || 'https://i.pravatar.cc/150'} className="w-12 h-12 rounded-full border-2 border-yellow-500/20" />
            <div>
              <p className="text-sm font-bold">{s.name}</p>
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{s.supporter_tier}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <h3 className="font-cinzel text-xl text-sky-400">Jogadores Cadastrados</h3>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-white/5 uppercase text-white/40">
              <th className="p-4">Usuário</th>
              <th className="p-4">Nível</th>
              <th className="p-4">XP</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map(u => (
              <tr key={u.id}>
                <td className="p-4 font-bold">{u.name}</td>
                <td className="p-4">{u.level}</td>
                <td className="p-4">{u.xp}</td>
                <td className="p-4"><span className="text-green-500">Ativo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMeritsTab = () => (
    <div className="space-y-6">
      <h3 className="font-cinzel text-xl text-purple-400">Galeria de Méritos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex flex-col items-center text-center space-y-3">
            <img src={m.image_url} className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/20" />
            <p className="text-xs font-bold truncate w-full">{m.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStickersTab = () => (
    <div className="space-y-6">
      <h3 className="font-cinzel text-xl text-blue-400">Catálogo de Figurinhas</h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {data.map(s => (
          <Card key={s.id} className="aspect-[3/4] p-1 border-white/10 overflow-hidden bg-slate-900 shadow-xl">
             <img src={s.image_url} className="w-full h-full object-cover rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] flex overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-slate-950/50 flex flex-col flex-shrink-0">
        <div className="p-8 border-b border-white/5 mb-4">
          <h2 className="font-cinzel text-lg font-bold text-yellow-500 tracking-tighter uppercase">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-lg' : 'text-white/40 hover:bg-white/5'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest">{tab.label}</p>
                <p className="text-[9px] opacity-50">{tab.desc}</p>
              </div>
            </button>
          ))}
        </nav>
        <div className="p-6">
          <button onClick={onClose} className="w-full py-3 glass rounded-xl text-xs font-bold uppercase hover:bg-white/10">Sair Admin</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden p-8 lg:p-12">
        {loading && (
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
           </div>
        )}

        <div className="max-w-6xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar pr-4">
           {activeTab === 'parasha' && renderParashaTab()}
           {activeTab === 'merits' && renderMeritsTab()}
           {activeTab === 'stickers' && renderStickersTab()}
           {activeTab === 'questions' && renderQuestionsTab()}
           {activeTab === 'music' && renderMusicTab()}
           {activeTab === 'supporters' && renderSupportersTab()}
           {activeTab === 'users' && renderUsersTab()}
        </div>

        {/* PARASHA MODAL - FORMULÁRIO COMPATÍVEL COM O BANCO */}
        {showParashaModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-2xl p-8 border-white/10 bg-slate-900 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button onClick={() => setShowParashaModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><i className="fas fa-times"></i></button>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-cinzel text-xl text-yellow-500 uppercase">Nova Parashá Manual</h3>
                  <Button variant="outline" className="text-[10px]" onClick={handleSyncParashaToForm} disabled={loading}>
                     {loading ? <i className="fas fa-spinner animate-spin"></i> : '🔄 Sincronizar Chabad.org'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome (PT)</label>
                      <input type="text" value={parashaForm.name_pt} onChange={e => setParashaForm({...parashaForm, name_pt: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" placeholder="Ex: Bereshit" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome (HE)</label>
                      <input type="text" value={parashaForm.name_he} onChange={e => setParashaForm({...parashaForm, name_he: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm text-right font-serif" placeholder="Ex: בראשית" />
                   </div>

                   {/* CAMPOS DE DATA */}
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Data de Início</label>
                      <input type="date" value={parashaForm.start_date} onChange={e => setParashaForm({...parashaForm, start_date: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Data de Fim</label>
                      <input type="date" value={parashaForm.end_date} onChange={e => setParashaForm({...parashaForm, end_date: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>

                   <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Resumo da Parashá</label>
                      <textarea value={parashaForm.summary} onChange={e => setParashaForm({...parashaForm, summary: e.target.value})} rows={6} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none resize-none text-sm" placeholder="Descreva o tema central e lições da semana..." />
                   </div>
                   <div className="col-span-2 space-y-3">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Banner da Parashá</label>
                      <div className="flex gap-3">
                         <div className="flex-1 bg-black/40 h-28 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                            {parashaForm.banner_url ? <img src={parashaForm.banner_url} className="w-full h-full object-cover" /> : <i className="fas fa-image text-white/10 text-2xl"></i>}
                         </div>
                         <div className="flex flex-col gap-2">
                            <Button variant="outline" className="text-[10px] py-1 px-4" onClick={generateManualBanner} disabled={loading}>✨ IA Banner</Button>
                            <input type="text" value={parashaForm.banner_url} onChange={e => setParashaForm({...parashaForm, banner_url: e.target.value})} className="w-full bg-black/40 border border-white/10 p-1 rounded text-[9px] outline-none" placeholder="Link da imagem..." />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3 sticky bottom-0 bg-slate-900 pt-4 border-t border-white/5">
                   <Button variant="ghost" className="flex-1" onClick={() => setShowParashaModal(false)}>Cancelar</Button>
                   <Button variant="gold" className="flex-[2]" onClick={handleManualParashaSave} disabled={loading}>Salvar Parashá</Button>
                </div>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
