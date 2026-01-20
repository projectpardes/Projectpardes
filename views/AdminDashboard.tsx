
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { PortalType, Rarity } from '../types';
import { generateAdminText, generateAdminImage, generateQuestionBatch } from '../services/geminiService';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshParasha: () => void;
  onRefreshMerits: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshParasha, onRefreshMerits }) => {
  const [activeTab, setActiveTab] = useState('parasha');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms
  const [parashaForm, setParashaForm] = useState({ namePt: '', nameHe: '', startDate: '', endDate: '', spiritualPhrase: '', summary: '', bannerUrl: '', isCurrent: false });
  const [stickerForm, setStickerForm] = useState({ name: '', description: '', imageUrl: '', rarity: 'Comum' });
  const [meritForm, setMeritForm] = useState({ name: '', description: '', imageUrl: '', type: 'Quizzes', targetValue: 0 });
  const [shopForm, setShopForm] = useState({ name: '', description: '', cost: 50, icon: 'fa-star', color: 'text-yellow-500' });
  const [nigunForm, setNigunForm] = useState({ name: '', url: '', category: 'Dashboard', isActive: true });
  const [questionForm, setQuestionForm] = useState({ portal: PortalType.PSHAT, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', xpReward: 100, difficulty: 1 });

  const getTargetTable = (portal: PortalType) => {
    switch(portal) {
      case PortalType.PSHAT: return 'pshat_questions';
      case PortalType.REMEZ: return 'remez_questions';
      case PortalType.DRASH: return 'drash_questions';
      case PortalType.SOD: return 'sod_questions';
      case PortalType.NOAHIDE: return 'nohide_questions';
      default: return 'pshat_questions';
    }
  };

  const getTableByTab = (tab: string) => {
    switch(tab) {
      case 'parasha': return 'parashiot';
      case 'questions': return getTargetTable(questionForm.portal);
      case 'merits': return 'merits';
      case 'stickers': return 'stickers';
      case 'shop': return 'shop_items';
      case 'nigun': return 'nigunim';
      default: return '';
    }
  };

  useEffect(() => {
    fetchListData();
  }, [activeTab, questionForm.portal]);

  const fetchListData = async () => {
    const table = getTableByTab(activeTab);
    if (!table) return;
    
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar dados:", error);
      setListData([]);
      return;
    }
    if (data) setListData(data);
  };

  const handleGenerateBatch = async () => {
    setAiLoading(true);
    try {
      const portal = questionForm.portal;
      const targetTable = getTargetTable(portal);
      
      const batch = await generateQuestionBatch(portal, 10);
      if (!batch || batch.length === 0) throw new Error("IA não retornou dados.");

      const payload = batch.map(q => ({
        text: q.text,
        options: q.options,
        correct_answer: q.correctAnswer, 
        explanation: q.explanation,
        xp_reward: q.xpReward || 100,           
        difficulty: q.difficulty || 1
      }));

      const { error: insertError } = await supabase.from(targetTable).insert(payload);
      if (insertError) throw insertError;

      alert(`Sucesso! 10 perguntas salvas em ${targetTable}.`);
      fetchListData();
    } catch (e: any) {
      console.error(e);
      alert("Erro ao salvar lote: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const table = getTableByTab(activeTab);
    let payload: any = {};

    switch(activeTab) {
      case 'parasha': 
        payload = { name_pt: parashaForm.namePt, name_he: parashaForm.nameHe, start_date: parashaForm.startDate, end_date: parashaForm.endDate, spiritual_phrase: parashaForm.spiritualPhrase, summary: parashaForm.summary, banner_url: parashaForm.bannerUrl, is_current: parashaForm.isCurrent };
        break;
      case 'questions':
        payload = { text: questionForm.text, options: questionForm.options, correct_answer: questionForm.correctAnswer, explanation: questionForm.explanation, xp_reward: questionForm.xpReward, difficulty: questionForm.difficulty };
        break;
      case 'merits':
        payload = { name: meritForm.name, description: meritForm.description, image_url: meritForm.imageUrl, type: meritForm.type, target_value: meritForm.targetValue };
        break;
      case 'stickers':
        payload = { name: stickerForm.name, description: stickerForm.description, image_url: stickerForm.imageUrl, rarity: stickerForm.rarity };
        break;
      case 'shop':
        payload = { name: shopForm.name, description: shopForm.description, cost: shopForm.cost, icon: shopForm.icon, color: shopForm.color };
        break;
      case 'nigun':
        payload = { name: nigunForm.name, url: nigunForm.url, category: nigunForm.category, is_active: nigunForm.isActive };
        break;
    }

    try {
      let error;
      if (editingId) {
        const res = await supabase.from(table).update(payload).eq('id', editingId);
        error = res.error;
      } else {
        const res = await supabase.from(table).insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      alert("Dados salvos com sucesso!");
      resetForms();
      fetchListData();
      if (activeTab === 'parasha') onRefreshParasha();
      if (activeTab === 'merits') onRefreshMerits();
    } catch (e: any) { 
      console.error(e); 
      alert(`Erro: ${e.message}`);
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item permanentemente?')) return;
    const table = getTableByTab(activeTab);
    
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      alert("Item excluído com sucesso.");
      fetchListData();
    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir: " + (err.message || "Verifique as permissões do banco."));
    }
  };

  const resetForms = () => {
    setEditingId(null);
    setParashaForm({ namePt: '', nameHe: '', startDate: '', endDate: '', spiritualPhrase: '', summary: '', bannerUrl: '', isCurrent: false });
    setStickerForm({ name: '', description: '', imageUrl: '', rarity: 'Comum' });
    setMeritForm({ name: '', description: '', imageUrl: '', type: 'Quizzes', targetValue: 0 });
    setShopForm({ name: '', description: '', cost: 50, icon: 'fa-star', color: 'text-yellow-500' });
    setNigunForm({ name: '', url: '', category: 'Dashboard', isActive: true });
    setQuestionForm(prev => ({ ...prev, text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', xpReward: 100, difficulty: 1 }));
  };

  const handleAiText = async () => {
    setAiLoading(true);
    try {
      if (activeTab === 'parasha') {
        const result = await generateAdminText('parasha', parashaForm.namePt);
        setParashaForm(prev => ({ ...prev, spiritualPhrase: result.spiritualPhrase, summary: result.summary }));
      } else if (activeTab === 'merits') {
        const result = await generateAdminText('merit', meritForm.name);
        setMeritForm(prev => ({ ...prev, name: result.name, description: result.description }));
      } else if (activeTab === 'stickers') {
        const result = await generateAdminText('sticker', stickerForm.name);
        setStickerForm(prev => ({ ...prev, name: result.name, description: result.description }));
      }
    } catch (e) { console.error(e); } finally { setAiLoading(false); }
  };

  const handleAiImage = async () => {
    setAiLoading(true);
    try {
      let prompt = "";
      let aspect: "1:1" | "16:9" | "4:3" | "3:4" | "9:16" = "1:1";
      if (activeTab === 'parasha') {
        prompt = `Torah portion banner for ${parashaForm.namePt}`;
        aspect = "16:9";
      } else if (activeTab === 'merits') {
        prompt = `Achievement badge for ${meritForm.name}`;
      } else if (activeTab === 'stickers') {
        prompt = `Collectible card of ${stickerForm.name}`;
        aspect = "3:4";
      }
      
      const imageUrl = await generateAdminImage(prompt, aspect);
      if (imageUrl) {
        if (activeTab === 'parasha') setParashaForm(prev => ({ ...prev, bannerUrl: imageUrl }));
        if (activeTab === 'merits') setMeritForm(prev => ({ ...prev, imageUrl: imageUrl }));
        if (activeTab === 'stickers') setStickerForm(prev => ({ ...prev, imageUrl: imageUrl }));
      }
    } catch (e) { console.error(e); } finally { setAiLoading(false); }
  };

  const tabs = [
    { id: 'parasha', icon: 'fa-book-open', label: 'Parashá' },
    { id: 'questions', icon: 'fa-circle-question', label: 'Perguntas' },
    { id: 'merits', icon: 'fa-medal', label: 'Méritos' },
    { id: 'stickers', icon: 'fa-box-archive', label: 'Figurinhas' },
    { id: 'shop', icon: 'fa-store', label: 'Loja' },
    { id: 'nigun', icon: 'fa-guitar', label: 'Nigunim' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-white overflow-hidden">
      <header className="p-6 bg-slate-950 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full hover:bg-white/10"><i className="fas fa-arrow-left"></i></button>
          <h2 className="text-xl font-cinzel font-bold text-yellow-500">Admin 3.0</h2>
        </div>
        <div className="flex gap-2">
          {editingId && <Button variant="outline" onClick={resetForms}>Cancelar</Button>}
          <Button variant="gold" onClick={handleSave} disabled={loading}>
            {loading ? <i className="fas fa-circle-notch animate-spin"></i> : (editingId ? 'Atualizar' : 'Salvar')}
          </Button>
        </div>
      </header>

      <div className="flex bg-slate-950/40 border-b border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => { setActiveTab(tab.id); resetForms(); }} 
            className={`px-8 py-5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-white/30'}`}
          >
            <i className={`fas ${tab.icon} mr-2`}></i> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-8 gap-8">
        <div className="lg:w-1/3 overflow-y-auto pr-4 custom-scrollbar">
          {activeTab === 'parasha' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input placeholder="Nome PT" value={parashaForm.namePt} onChange={e => setParashaForm({...parashaForm, namePt: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiText} disabled={aiLoading || !parashaForm.namePt} className="w-14 h-14 !p-0 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <i className="fas fa-sparkles"></i>
                </Button>
              </div>
              <input placeholder="Nome HE" value={parashaForm.nameHe} onChange={e => setParashaForm({...parashaForm, nameHe: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <textarea placeholder="Resumo" value={parashaForm.summary} onChange={e => setParashaForm({...parashaForm, summary: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-32 outline-none" />
              <div className="flex gap-2">
                <input placeholder="URL Banner" value={parashaForm.bannerUrl} onChange={e => setParashaForm({...parashaForm, bannerUrl: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiImage} disabled={aiLoading} className="w-14 h-14 !p-0 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <i className="fas fa-image"></i>
                </Button>
              </div>
              <div className="flex items-center gap-2 px-2">
                <input type="checkbox" id="isCurrent" checked={parashaForm.isCurrent} onChange={e => setParashaForm({...parashaForm, isCurrent: e.target.checked})} />
                <label htmlFor="isCurrent" className="text-xs uppercase font-bold text-white/40">Definir como Parashá da Semana</label>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <select 
                  value={questionForm.portal} 
                  onChange={e => setQuestionForm({...questionForm, portal: e.target.value as PortalType})} 
                  className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none"
                >
                  {Object.values(PortalType).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Button onClick={handleGenerateBatch} disabled={aiLoading} className="px-4 bg-purple-600/20 text-purple-400 text-[10px] uppercase font-bold tracking-widest">
                  {aiLoading ? <i className="fas fa-circle-notch animate-spin"></i> : "Gerar 10"}
                </Button>
              </div>
              <textarea placeholder="Pergunta" value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-24 outline-none" />
              {questionForm.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <button onClick={() => setQuestionForm({...questionForm, correctAnswer: i})} className={`w-10 h-10 rounded-lg border font-black ${questionForm.correctAnswer === i ? 'bg-green-500 border-green-500 text-slate-950' : 'border-white/10 text-white/20'}`}>{i+1}</button>
                  <input placeholder={`Opção ${i+1}`} value={opt} onChange={e => { const n = [...questionForm.options]; n[i] = e.target.value; setQuestionForm({...questionForm, options: n})}} className="flex-1 bg-slate-800/50 border border-white/10 p-3 rounded-xl outline-none" />
                </div>
              ))}
              <textarea placeholder="Explicação" value={questionForm.explanation} onChange={e => setQuestionForm({...questionForm, explanation: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-24 outline-none" />
            </div>
          )}

          {activeTab === 'merits' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input placeholder="Nome do Mérito" value={meritForm.name} onChange={e => setMeritForm({...meritForm, name: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiText} disabled={aiLoading || !meritForm.name} className="w-14 h-14 !p-0 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <i className="fas fa-sparkles"></i>
                </Button>
              </div>
              <textarea placeholder="Descrição" value={meritForm.description} onChange={e => setMeritForm({...meritForm, description: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-24 outline-none" />
              <div className="flex gap-2">
                <input placeholder="URL da Imagem" value={meritForm.imageUrl} onChange={e => setMeritForm({...meritForm, imageUrl: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiImage} disabled={aiLoading} className="w-14 h-14 !p-0 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <i className="fas fa-image"></i>
                </Button>
              </div>
              <select value={meritForm.type} onChange={e => setMeritForm({...meritForm, type: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none">
                <option value="Quizzes">Quizzes Completados</option>
                <option value="Level">Nível Alcançado</option>
                <option value="XP">XP Acumulado</option>
              </select>
            </div>
          )}

          {activeTab === 'stickers' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input placeholder="Nome da Figurinha" value={stickerForm.name} onChange={e => setStickerForm({...stickerForm, name: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiText} disabled={aiLoading || !stickerForm.name} className="w-14 h-14 !p-0 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <i className="fas fa-sparkles"></i>
                </Button>
              </div>
              <textarea placeholder="Descrição" value={stickerForm.description} onChange={e => setStickerForm({...stickerForm, description: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-24 outline-none" />
              <div className="flex gap-2">
                <input placeholder="URL da Imagem" value={stickerForm.imageUrl} onChange={e => setStickerForm({...stickerForm, imageUrl: e.target.value})} className="flex-1 bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
                <Button onClick={handleAiImage} disabled={aiLoading} className="w-14 h-14 !p-0 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <i className="fas fa-image"></i>
                </Button>
              </div>
              <select value={stickerForm.rarity} onChange={e => setStickerForm({...stickerForm, rarity: e.target.value as Rarity})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none">
                {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-4">
              <input placeholder="Nome do Item" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <textarea placeholder="Descrição" value={shopForm.description} onChange={e => setShopForm({...shopForm, description: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl h-24 outline-none" />
              <input type="number" placeholder="Custo (Centelhas)" value={shopForm.cost} onChange={e => setShopForm({...shopForm, cost: parseInt(e.target.value)})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <input placeholder="Ícone FontAwesome (ex: fa-heart)" value={shopForm.icon} onChange={e => setShopForm({...shopForm, icon: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <input placeholder="Cor Tailwind (ex: text-red-500)" value={shopForm.color} onChange={e => setShopForm({...shopForm, color: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
            </div>
          )}

          {activeTab === 'nigun' && (
            <div className="space-y-4">
              <input placeholder="Nome do Nigun" value={nigunForm.name} onChange={e => setNigunForm({...nigunForm, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <input placeholder="URL do Áudio (.mp3)" value={nigunForm.url} onChange={e => setNigunForm({...nigunForm, url: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none" />
              <select value={nigunForm.category} onChange={e => setNigunForm({...nigunForm, category: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-xl outline-none">
                <option value="Dashboard">Dashboard</option>
                <option value="Quiz">Quiz</option>
                <option value="Ranking">Ranking</option>
                <option value="Álbum">Álbum</option>
                <option value="Loja">Loja</option>
                <option value="Abertura">Abertura</option>
              </select>
              <div className="flex items-center gap-2 px-2">
                <input type="checkbox" id="isActive" checked={nigunForm.isActive} onChange={e => setNigunForm({...nigunForm, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="text-xs uppercase font-bold text-white/40">Música Ativa</label>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-2/3 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-white/20">
            {activeTab === 'questions' ? `Questões em ${questionForm.portal}` : 'Registros'}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
            {listData.map((item: any) => (
              <Card key={item.id} className="p-5 flex items-center justify-between border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
                <div className="flex-1 truncate">
                  <h4 className="font-bold text-white/90 truncate">
                    {activeTab === 'questions' ? item.text : (item.name_pt || item.name)}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    ID: {item.id.substring(0,8)} | {activeTab === 'questions' ? questionForm.portal : 'Registro'}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button 
                    onClick={() => {
                      setEditingId(item.id);
                      if (activeTab === 'parasha') setParashaForm({ namePt: item.name_pt, nameHe: item.name_he, startDate: item.start_date, endDate: item.end_date, spiritualPhrase: item.spiritual_phrase, summary: item.summary, bannerUrl: item.banner_url, isCurrent: item.is_current });
                      if (activeTab === 'questions') setQuestionForm({ portal: questionForm.portal, text: item.text, options: item.options, correctAnswer: item.correct_answer, explanation: item.explanation, xpReward: item.xp_reward, difficulty: item.difficulty });
                      if (activeTab === 'merits') setMeritForm({ name: item.name, description: item.description, imageUrl: item.image_url, type: item.type, targetValue: item.target_value });
                      if (activeTab === 'stickers') setStickerForm({ name: item.name, description: item.description, imageUrl: item.image_url, rarity: item.rarity });
                      if (activeTab === 'shop') setShopForm({ name: item.name, description: item.description, cost: item.cost, icon: item.icon, color: item.color });
                      if (activeTab === 'nigun') setNigunForm({ name: item.name, url: item.url, category: item.category, isActive: item.is_active });
                    }}
                    className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg"
                  ><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg"><i className="fas fa-trash"></i></button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
