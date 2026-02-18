
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PortalType, Rarity, Sticker, UserProfile } from '../types';
import { syncParashaWithChabad, generateParashaBannerAI, generateMeritBadge, generateStickerAI, generateQuestionBatch } from '../services/geminiService';
import { soundManager, SFX } from '../services/soundService';
import { GoogleGenAI, Type } from "@google/genai";

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

  // --- STATES DOS MODAIS ---
  const [showParashaModal, setShowParashaModal] = useState(false);
  const [showMeritModal, setShowMeritModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);

  // --- FORMS STATES ---
  const [parashaForm, setParashaForm] = useState({
    id: '', name_pt: '', name_he: '', summary: '', banner_url: '',
    start_date: formatDateForInput(new Date()),
    end_date: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  });

  const [meritForm, setMeritForm] = useState({
    id: '', name: '', description: '', image_url: ''
  });

  const [stickerForm, setStickerForm] = useState({
    id: '', name: '', description: '', rarity: Rarity.COMMON, image_url: ''
  });

  const [musicForm, setMusicForm] = useState({
    id: '', name: '', category: 'Dashboard', url: '', is_active: true
  });

  const [questionForm, setQuestionForm] = useState({
    id: '', 
    portal: PortalType.PSHAT, // Para saber em qual tabela salvar
    text: '', 
    difficulty: 1, 
    xp_reward: 10,
    option1: '', option2: '', option3: '', option4: '',
    correct_answer: 0, // Index 0-3
    explanation: ''
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

  const getQuestionTable = (portal: PortalType) => {
    switch(portal) {
      case PortalType.PSHAT: return 'pshat_questions';
      case PortalType.REMEZ: return 'remez_questions';
      case PortalType.DRASH: return 'drash_questions';
      case PortalType.SOD: return 'sod_questions';
      case PortalType.NOAHIDE: return 'nohide_questions';
      default: return 'pshat_questions';
    }
  };

  const fetchTabData = async () => {
    setLoading(true);
    let table = '';
    
    switch (activeTab) {
      case 'parasha': table = 'parashiot'; break;
      case 'merits': table = 'merits'; break;
      case 'stickers': table = 'stickers'; break;
      case 'questions': table = 'pshat_questions'; break; // Default view for now
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

  // --- HANDLERS DE EDIÇÃO (PREENCHER FORMULÁRIO E ABRIR MODAL) ---

  const handleEditParasha = (p: any) => {
    setParashaForm({
      id: p.id,
      name_pt: p.name_pt || '',
      name_he: p.name_he || '',
      summary: p.summary || '',
      banner_url: p.banner_url || '',
      start_date: p.start_date ? formatDateForInput(new Date(p.start_date)) : formatDateForInput(new Date()),
      end_date: p.end_date ? formatDateForInput(new Date(p.end_date)) : formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    });
    setShowParashaModal(true);
  };

  const handleEditMerit = (m: any) => {
    setMeritForm({
      id: m.id,
      name: m.name || '',
      description: m.description || '',
      image_url: m.image_url || ''
    });
    setShowMeritModal(true);
  };

  const handleEditSticker = (s: any) => {
    setStickerForm({
      id: s.id,
      name: s.name || '',
      description: s.description || '',
      rarity: s.rarity || Rarity.COMMON,
      image_url: s.image_url || ''
    });
    setShowStickerModal(true);
  };

  const handleEditMusic = (m: any) => {
    setMusicForm({
      id: m.id,
      name: m.name || '',
      category: m.category || 'Dashboard',
      url: m.url || '',
      is_active: m.is_active
    });
    setShowMusicModal(true);
  };

  const handleEditQuestion = (q: any) => {
    setQuestionForm({
      id: q.id,
      portal: PortalType.PSHAT, // Assumindo PSHAT pois é a tabela padrão
      text: q.text || '',
      difficulty: q.difficulty || 1,
      xp_reward: q.xp_reward || 10,
      option1: q.options?.[0] || '',
      option2: q.options?.[1] || '',
      option3: q.options?.[2] || '',
      option4: q.options?.[3] || '',
      correct_answer: q.correct_answer || 0,
      explanation: q.explanation || ''
    });
    setShowQuestionModal(true);
  };

  // --- HANDLERS DE GERAÇÃO IA ---

  const handleGenerateStickerText = async () => {
      setLoading(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Coleta nomes existentes para evitar duplicação
          // Assumindo que 'data' contém os stickers quando a aba 'stickers' está ativa
          let existingNames = "";
          if (activeTab === 'stickers' && data.length > 0) {
             existingNames = data.map((item: any) => item.name).filter(Boolean).join(", ");
          }

          let contextInstruction = "";
          
          switch (stickerForm.rarity) {
              case Rarity.COMMON:
                  contextInstruction = "Gere um OBJETO, UTENSÍLIO ou ARTEFATO histórico da época da Torá/Bíblica. Exemplos: Shofar, Harpa de David, Menorá do Templo, Escudo de David, Jarro de Azeite, Tenda de Abraão, Sandálias do Deserto, Cesto de Papiro.";
                  break;
              case Rarity.RARE:
                  contextInstruction = "Gere um RABINO ou RABANIT CONTEMPORÂNEO que esteja VIVO nos dias atuais e seja influente na sabedoria judaica. (Exemplos: Rabino Jonathan Sacks (recentemente falecido, mas ok), Rabino Manis Friedman, etc - foque em diversidade).";
                  break;
              case Rarity.EPIC:
                  contextInstruction = "Gere um GRANDE SÁBIO, RABINO ou LÍDER JUDEU que JÁ FALECEU (Z'L) PÓS-BÍBLICO. Pessoas que fizeram a diferença na história (ex: Rambam, Rashi, Baal Shem Tov, Baba Sali, Rebe de Lubavitch, Arizal).";
                  break;
              case Rarity.LEGENDARY:
                  contextInstruction = `Gere um GRANDE PERSONAGEM BÍBLICO (da Torá/Tanach) ou um Sábio do Talmud/Guemará. 
                  ATENÇÃO: NÃO REPITA PERSONAGENS COMUNS SE ELES JÁ ESTIVEREM NA LISTA DE EXCLUSÃO.
                  Considere personagens como: 
                  - Patriarcas/Matriarcas: Adam, Chava (Eva), Noach, Avraham, Sarah, Yitzhak, Rivka, Yaakov, Rachel, Leah.
                  - Líderes: Moshe, Aharon, Miriam, Yehoshua, Shmuel, David HaMelech, Shlomo HaMelech.
                  - Profetas/Heroínas: Eliyahu HaNavi, Elisha, Yirmiyahu, Yechezkel, Esther HaMalka, Mordechai, Deborah, Ruth.
                  - Sábios do Talmud: Hilel, Shamai, Rabi Akiva, Rabi Shimon Bar Yochai.`;
                  break;
              case Rarity.MYTHIC:
                  contextInstruction = "Gere um ATO DIVINO, MILAGRE, PRAGA DO EGITO, ANJO ou SEFIRÁ. Algo sobrenatural onde o próprio Hashem teve participação direta (ex: Abertura do Mar Vermelho, Praga dos Gafanhotos, Anjo Michael, Sefirá Keter, A Nuvem de Glória, O Maná, A Sarça Ardente).";
                  break;
              default:
                  contextInstruction = "Gere um tema judaico geral educativo.";
          }

          const prompt = `Crie um nome criativo e uma descrição curta e mística para uma figurinha colecionável de um jogo educativo judaico.
          
          A raridade é: ${stickerForm.rarity}.
          
          LISTA DE FIGURINHAS JÁ EXISTENTES (EVITE REPETIR ESTES NOMES):
          [${existingNames}]
          
          REGRA OBRIGATÓRIA DE CONTEÚDO: ${contextInstruction}
          
          Responda APENAS com um objeto JSON neste formato:
          { "name": "Nome da Figurinha", "description": "Descrição curta, inspiradora e educativa" }`;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          description: { type: Type.STRING }
                      },
                      required: ["name", "description"]
                  }
              }
          });

          const json = JSON.parse(response.text || '{}');
          if (json.name && json.description) {
              setStickerForm(prev => ({ ...prev, name: json.name, description: json.description }));
              soundManager.play(SFX.PAPER);
          } else {
              alert("A IA não retornou o formato esperado. Tente novamente.");
          }

      } catch (e: any) {
          console.error("Erro ao gerar texto figurinha:", e);
          alert("Erro: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleGenerateImage = async (type: 'merit' | 'sticker' | 'parasha') => {
    let description = '';
    let name = '';
    let aspectRatio = "1:1";

    if (type === 'merit') {
        description = meritForm.description;
        name = meritForm.name;
    } else if (type === 'sticker') {
        description = stickerForm.description;
        name = stickerForm.name;
    } else if (type === 'parasha') {
        description = parashaForm.summary;
        name = parashaForm.name_pt;
        aspectRatio = "16:9";
    }

    if (!description) return alert("Por favor, preencha o NOME e o RESUMO/DESCRIÇÃO antes de gerar a imagem.");

    setLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `A 3D Pixar/Disney style illustration of "${name}". Context: ${description}. Style: pixar/disney 3d; lighting: cinematic; high quality, 3d render, epic, spiritual, majestic, highly detailed, high resolution, solid dark background or transparent. Avoid childish or overly cartoonish proportions.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });

        let imageUrl = '';
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (imageUrl) {
            if (type === 'merit') {
                setMeritForm(prev => ({ ...prev, image_url: imageUrl }));
            } else if (type === 'sticker') {
                setStickerForm(prev => ({ ...prev, image_url: imageUrl }));
            } else if (type === 'parasha') {
                setParashaForm(prev => ({ ...prev, banner_url: imageUrl }));
            }
            soundManager.play(SFX.VICTORY); // Feedback sonoro
        } else {
            alert("Não foi possível gerar a imagem. Tente novamente.");
        }

    } catch (e: any) {
        console.error("Erro geração imagem:", e);
        alert("Erro ao gerar imagem: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLERS DE SAVE (SUPABASE) ---

  const handleSaveParasha = async () => {
    setLoading(true);
    try {
      const payload: any = {
        name_pt: parashaForm.name_pt,
        name_he: parashaForm.name_he,
        summary: parashaForm.summary,
        banner_url: parashaForm.banner_url,
        start_date: new Date(parashaForm.start_date).toISOString(),
        end_date: new Date(parashaForm.end_date).toISOString()
      };
      if (!parashaForm.id) payload.is_current = false;
      
      const query = parashaForm.id 
        ? supabase.from('parashiot').update(payload).eq('id', parashaForm.id)
        : supabase.from('parashiot').insert(payload);

      const { error } = await query;
      if (error) throw error;
      
      await finishSave('parasha');
    } catch (e: any) { alert("Erro: " + e.message); } finally { setLoading(false); }
  };

  const handleSaveMerit = async () => {
    setLoading(true);
    try {
      const payload = { 
        name: meritForm.name, 
        description: meritForm.description, 
        image_url: meritForm.image_url 
      };
      const query = meritForm.id 
        ? supabase.from('merits').update(payload).eq('id', meritForm.id)
        : supabase.from('merits').insert(payload);
      
      const { error } = await query;
      if (error) throw error;

      await finishSave('merits');
    } catch (e: any) { alert("Erro: " + e.message); } finally { setLoading(false); }
  };

  const handleSaveSticker = async () => {
    setLoading(true);
    try {
      const payload = { 
        name: stickerForm.name, 
        description: stickerForm.description, 
        rarity: stickerForm.rarity,
        image_url: stickerForm.image_url 
      };
      const query = stickerForm.id 
        ? supabase.from('stickers').update(payload).eq('id', stickerForm.id)
        : supabase.from('stickers').insert(payload);
      
      const { error } = await query;
      if (error) throw error;

      await finishSave('stickers');
    } catch (e: any) { alert("Erro: " + e.message); } finally { setLoading(false); }
  };

  const handleSaveMusic = async () => {
    setLoading(true);
    try {
      const payload = { 
        name: musicForm.name, 
        category: musicForm.category, 
        url: musicForm.url,
        is_active: musicForm.is_active
      };
      const query = musicForm.id 
        ? supabase.from('nigunim').update(payload).eq('id', musicForm.id)
        : supabase.from('nigunim').insert(payload);
      
      const { error } = await query;
      if (error) throw error;

      await finishSave('music');
    } catch (e: any) { alert("Erro: " + e.message); } finally { setLoading(false); }
  };

  const handleSaveQuestion = async () => {
    setLoading(true);
    try {
      const table = getQuestionTable(questionForm.portal);
      const optionsArray = [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4];
      
      const payload = {
        text: questionForm.text,
        difficulty: parseInt(String(questionForm.difficulty)),
        xp_reward: parseInt(String(questionForm.xp_reward)),
        options: optionsArray,
        correct_answer: parseInt(String(questionForm.correct_answer)),
        explanation: questionForm.explanation
      };

      const query = questionForm.id 
        ? supabase.from(table).update(payload).eq('id', questionForm.id)
        : supabase.from(table).insert(payload);
      
      const { error } = await query;
      if (error) throw error;

      await finishSave('questions');
    } catch (e: any) { alert("Erro: " + e.message); } finally { setLoading(false); }
  };

  const finishSave = async (tab: string) => {
    soundManager.play(SFX.SUCCESS);
    setShowParashaModal(false);
    setShowMeritModal(false);
    setShowStickerModal(false);
    setShowMusicModal(false);
    setShowQuestionModal(false);
    await fetchTabData();
    if (tab === 'parasha') onRefreshParasha();
    if (tab === 'merits') onRefreshMerits();
  };

  const handleGenericDelete = async (table: string, id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este item permanentemente?")) return;
    setLoading(true);
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      soundManager.play(SFX.PAPER);
      await fetchTabData();
      if (table === 'merits') onRefreshMerits();
      if (table === 'parashiot') onRefreshParasha();
    } catch (e: any) {
      console.error("Erro ao excluir:", e);
      alert(`Erro ao excluir: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParasha = (id: string) => {
    handleGenericDelete('parashiot', id);
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

  // --- RENDERS ---

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-green-400">Banco de Questões</h3>
        <div className="flex gap-2">
            <Button variant="gold" onClick={() => {
                setQuestionForm({ id: '', portal: PortalType.PSHAT, text: '', difficulty: 1, xp_reward: 10, option1: '', option2: '', option3: '', option4: '', correct_answer: 0, explanation: '' });
                setShowQuestionModal(true);
            }}>➕ Nova Pergunta</Button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(q => (
          <Card key={q.id} className="p-4 border-white/5 flex justify-between items-center group hover:bg-white/5">
             <div className="flex-1 mr-4">
                 <p className="text-sm font-medium line-clamp-1">{q.text}</p>
                 <p className="text-[9px] text-white/40">Dificuldade: {q.difficulty} | XP: {q.xp_reward}</p>
             </div>
             <div className="flex gap-2">
                <button className="text-white/20 hover:text-white p-2" onClick={() => handleEditQuestion(q)} title="Editar">
                   <i className="fas fa-edit"></i>
                </button>
                <button className="text-red-500/50 hover:text-red-500 p-2" onClick={() => handleGenericDelete('pshat_questions', q.id)} title="Excluir">
                   <i className="fas fa-trash"></i>
                </button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMusicTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-pink-500">Nigunim e Trilhas</h3>
        <Button variant="gold" onClick={() => {
            setMusicForm({ id: '', name: '', category: 'Dashboard', url: '', is_active: true });
            setShowMusicModal(true);
        }}>➕ Adicionar Música</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex items-center justify-between bg-slate-900/40 group hover:bg-slate-900/60">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <i className="fas fa-music"></i>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{m.name}</p>
                <p className="text-[10px] text-white/30 uppercase">{m.category}</p>
              </div>
            </div>
            <div className="flex gap-3">
               <button className="text-white/20 hover:text-white p-2" onClick={() => handleEditMusic(m)} title="Editar">
                  <i className="fas fa-edit"></i>
               </button>
               <button className="text-red-500/50 hover:text-red-500 p-2" onClick={() => handleGenericDelete('nigunim', m.id)} title="Excluir">
                  <i className="fas fa-trash"></i>
               </button>
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
        <Button variant="gold" onClick={() => {
            setMeritForm({ id: '', name: '', description: '', image_url: '' });
            setShowMeritModal(true);
        }}>➕ Novo Mérito</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(m => (
          <Card key={m.id} className="p-4 flex flex-col items-center text-center space-y-3 relative group overflow-hidden">
            <img src={m.image_url} className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/20" />
            <p className="text-xs font-bold truncate w-full">{m.name}</p>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-slate-900/90 rounded-lg p-1 backdrop-blur-md z-10 border border-white/10">
               <button className="text-white/70 hover:text-white p-1.5" onClick={() => handleEditMerit(m)} title="Editar">
                  <i className="fas fa-edit text-xs"></i>
               </button>
               <button className="text-red-500/70 hover:text-red-500 p-1.5" onClick={() => handleGenericDelete('merits', m.id)} title="Excluir">
                  <i className="fas fa-trash text-xs"></i>
               </button>
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
        <Button variant="gold" onClick={() => {
            setStickerForm({ id: '', name: '', description: '', rarity: Rarity.COMMON, image_url: '' });
            setShowStickerModal(true);
        }}>➕ Nova Figurinha</Button>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {data.map(s => (
          <Card key={s.id} className="aspect-[3/4] p-1 border-white/10 overflow-hidden bg-slate-900 shadow-xl relative group">
             <img src={s.image_url} className="w-full h-full object-cover rounded-lg" />
             
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-slate-900/90 rounded-lg p-1 backdrop-blur-md z-10 border border-white/10">
                <button className="text-white/70 hover:text-white p-1.5" onClick={() => handleEditSticker(s)} title="Editar">
                   <i className="fas fa-edit text-xs"></i>
                </button>
                <button className="text-red-500/70 hover:text-red-500 p-1.5" onClick={() => handleGenericDelete('stickers', s.id)} title="Excluir">
                   <i className="fas fa-trash text-xs"></i>
                </button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderParashaTab = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-cinzel text-xl text-yellow-500">Gestão de Parashá</h3>
        <div className="flex gap-2">
          <Button variant="gold" onClick={() => {
            setParashaForm({ 
              id: '', name_pt: '', name_he: '', summary: '', banner_url: '',
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
                   
                   <div className="flex items-center gap-2">
                      <Button variant="ghost" className="text-[10px] py-1 px-2 h-fit text-white/50 hover:text-white" onClick={() => handleEditParasha(p)} title="Editar">
                         <i className="fas fa-edit"></i>
                      </Button>
                      <Button variant="ghost" className="text-[10px] py-1 px-2 h-fit text-red-500/50 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteParasha(p.id)} title="Excluir">
                         <i className="fas fa-trash"></i>
                      </Button>
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

        {/* --- MODAIS DE EDIÇÃO --- */}

        {/* MODAL PARASHÁ */}
        {showParashaModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-2xl p-8 border-white/10 bg-slate-900 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                <button onClick={() => setShowParashaModal(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><i className="fas fa-times"></i></button>
                <h3 className="font-cinzel text-xl text-yellow-500 uppercase mb-6">{parashaForm.id ? 'Editar Parashá' : 'Nova Parashá'}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome (PT)</label>
                      <input type="text" value={parashaForm.name_pt} onChange={e => setParashaForm({...parashaForm, name_pt: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome (HE)</label>
                      <input type="text" value={parashaForm.name_he} onChange={e => setParashaForm({...parashaForm, name_he: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm text-right" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Início</label>
                      <input type="date" value={parashaForm.start_date} onChange={e => setParashaForm({...parashaForm, start_date: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Fim</label>
                      <input type="date" value={parashaForm.end_date} onChange={e => setParashaForm({...parashaForm, end_date: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Resumo</label>
                      <textarea value={parashaForm.summary} onChange={e => setParashaForm({...parashaForm, summary: e.target.value})} rows={4} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm resize-none" />
                   </div>
                   <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Banner URL</label>
                      <div className="flex gap-2">
                          <input type="text" value={parashaForm.banner_url} onChange={e => setParashaForm({...parashaForm, banner_url: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                          <Button variant="outline" className="text-[10px] whitespace-nowrap px-3" onClick={() => handleGenerateImage('parasha')}>
                            ✨ IA
                          </Button>
                      </div>
                      {parashaForm.banner_url && <img src={parashaForm.banner_url} className="mt-2 h-20 rounded object-cover" />}
                   </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowParashaModal(false)}>Cancelar</Button>
                    <Button variant="gold" className="flex-[2]" onClick={handleSaveParasha}>Salvar</Button>
                </div>
             </Card>
          </div>
        )}

        {/* MODAL MÉRITOS */}
        {showMeritModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-md p-8 border-white/10 bg-slate-900 shadow-2xl">
                <h3 className="font-cinzel text-xl text-purple-400 uppercase mb-6">{meritForm.id ? 'Editar Mérito' : 'Novo Mérito'}</h3>
                <div className="space-y-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome</label>
                      <input type="text" value={meritForm.name} onChange={e => setMeritForm({...meritForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Descrição</label>
                      <input type="text" value={meritForm.description} onChange={e => setMeritForm({...meritForm, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Imagem URL</label>
                      <div className="flex gap-2">
                        <input type="text" value={meritForm.image_url} onChange={e => setMeritForm({...meritForm, image_url: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                        <Button variant="outline" className="text-[10px] whitespace-nowrap px-3" onClick={() => handleGenerateImage('merit')}>
                          ✨ IA
                        </Button>
                      </div>
                      {meritForm.image_url && <div className="flex justify-center mt-2"><img src={meritForm.image_url} className="w-16 h-16 rounded-full object-cover border border-white/20" /></div>}
                   </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowMeritModal(false)}>Cancelar</Button>
                    <Button variant="gold" className="flex-[2]" onClick={handleSaveMerit}>Salvar</Button>
                </div>
             </Card>
          </div>
        )}

        {/* MODAL FIGURINHAS */}
        {showStickerModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-md p-8 border-white/10 bg-slate-900 shadow-2xl">
                <h3 className="font-cinzel text-xl text-blue-400 uppercase mb-6">{stickerForm.id ? 'Editar Figurinha' : 'Nova Figurinha'}</h3>
                <div className="space-y-4 mb-6">
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Raridade</label>
                      <div className="flex gap-2">
                          <select value={stickerForm.rarity} onChange={e => setStickerForm({...stickerForm, rarity: e.target.value as Rarity})} className="flex-1 bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm text-white">
                             {Object.values(Rarity).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <Button variant="outline" className="text-[10px] whitespace-nowrap px-3" onClick={handleGenerateStickerText}>
                            ✨ Gerar Texto
                          </Button>
                      </div>
                   </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome</label>
                      <input type="text" value={stickerForm.name} onChange={e => setStickerForm({...stickerForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Descrição</label>
                      <input type="text" value={stickerForm.description} onChange={e => setStickerForm({...stickerForm, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Imagem URL</label>
                      <div className="flex gap-2">
                        <input type="text" value={stickerForm.image_url} onChange={e => setStickerForm({...stickerForm, image_url: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                        <Button variant="outline" className="text-[10px] whitespace-nowrap px-3" onClick={() => handleGenerateImage('sticker')}>
                          ✨ IA
                        </Button>
                      </div>
                      {stickerForm.image_url && <div className="flex justify-center mt-2"><img src={stickerForm.image_url} className="h-24 rounded object-cover border border-white/20" /></div>}
                   </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowStickerModal(false)}>Cancelar</Button>
                    <Button variant="gold" className="flex-[2]" onClick={handleSaveSticker}>Salvar</Button>
                </div>
             </Card>
          </div>
        )}

        {/* MODAL MÚSICA */}
        {showMusicModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-md p-8 border-white/10 bg-slate-900 shadow-2xl">
                <h3 className="font-cinzel text-xl text-pink-500 uppercase mb-6">{musicForm.id ? 'Editar Música' : 'Nova Música'}</h3>
                <div className="space-y-4 mb-6">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Nome</label>
                      <input type="text" value={musicForm.name} onChange={e => setMusicForm({...musicForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Categoria</label>
                      <select value={musicForm.category} onChange={e => setMusicForm({...musicForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm text-white">
                         <option value="Dashboard">Dashboard</option>
                         <option value="Quiz">Quiz</option>
                         <option value="Ranking">Ranking</option>
                         <option value="Álbum">Álbum</option>
                         <option value="Loja">Loja</option>
                         <option value="Abertura">Abertura</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">URL (MP3)</label>
                      <input type="text" value={musicForm.url} onChange={e => setMusicForm({...musicForm, url: e.target.value})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="flex items-center gap-2">
                      <input type="checkbox" checked={musicForm.is_active} onChange={e => setMusicForm({...musicForm, is_active: e.target.checked})} className="w-4 h-4" />
                      <label className="text-sm">Música Ativa</label>
                   </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowMusicModal(false)}>Cancelar</Button>
                    <Button variant="gold" className="flex-[2]" onClick={handleSaveMusic}>Salvar</Button>
                </div>
             </Card>
          </div>
        )}

        {/* MODAL PERGUNTAS */}
        {showQuestionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
             <Card className="w-full max-w-2xl p-8 border-white/10 bg-slate-900 shadow-2xl relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                <h3 className="font-cinzel text-xl text-green-500 uppercase mb-6">{questionForm.id ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Select Portal - Só editável se criando nova, para evitar complexidade de mover tabelas */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Portal (Tabela)</label>
                      <select 
                        value={questionForm.portal} 
                        onChange={e => setQuestionForm({...questionForm, portal: e.target.value as PortalType})} 
                        disabled={!!questionForm.id} // Não muda tabela na edição para não perder ID
                        className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm text-white"
                      >
                         {Object.values(PortalType).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                   </div>

                   <div className="col-span-2 space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Enunciado</label>
                      <textarea value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} rows={3} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm resize-none" />
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Dificuldade (1-5)</label>
                      <input type="number" min="1" max="5" value={questionForm.difficulty} onChange={e => setQuestionForm({...questionForm, difficulty: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Recompensa XP</label>
                      <input type="number" value={questionForm.xp_reward} onChange={e => setQuestionForm({...questionForm, xp_reward: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm" />
                   </div>

                   {/* Opções */}
                   <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                       {[1, 2, 3, 4].map((n, i) => (
                           <div key={n} className="space-y-1">
                               <label className={`text-[10px] uppercase font-bold ${questionForm.correct_answer === i ? 'text-green-500' : 'text-white/40'}`}>
                                   Opção {n} {questionForm.correct_answer === i && '(Correta)'}
                               </label>
                               <div className="flex gap-2">
                                   <input 
                                     type="radio" 
                                     name="correct" 
                                     checked={questionForm.correct_answer === i} 
                                     onChange={() => setQuestionForm({...questionForm, correct_answer: i})} 
                                     className="mt-2"
                                   />
                                   <input 
                                     type="text" 
                                     value={(questionForm as any)[`option${n}`]} 
                                     onChange={e => setQuestionForm({...questionForm, [`option${n}`]: e.target.value})} 
                                     className={`w-full bg-black/40 border p-2 rounded-lg outline-none text-sm ${questionForm.correct_answer === i ? 'border-green-500/50' : 'border-white/10'}`} 
                                   />
                               </div>
                           </div>
                       ))}
                   </div>

                   <div className="col-span-2 space-y-1 mt-2">
                      <label className="text-[10px] text-white/40 uppercase font-bold">Explicação da Resposta</label>
                      <textarea value={questionForm.explanation} onChange={e => setQuestionForm({...questionForm, explanation: e.target.value})} rows={3} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg outline-none text-sm resize-none" />
                   </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowQuestionModal(false)}>Cancelar</Button>
                    <Button variant="gold" className="flex-[2]" onClick={handleSaveQuestion}>Salvar Questão</Button>
                </div>
             </Card>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
