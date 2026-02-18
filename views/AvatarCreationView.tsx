import React, { useState, useRef } from 'react';
import { UserProfile, PortalType } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GoogleGenAI } from "@google/genai";

interface AvatarCreationViewProps {
  onComplete: (user: UserProfile) => void;
}

const SKIN_TONES = ['#FAD4B2', '#E1AC88', '#C68642', '#8D5524', '#3E2723'];
const HAIR_COLORS = ['#F9E4B7', '#A67C52', '#4E342E', '#212121', '#B71C1C', '#8B0000'];

const CLOTHING_OPTIONS = {
  male: ['Tradicional', 'Chassídico', 'Sefardi', 'Moderno Judaico', 'Yeshiva', 'Moderno Discreto'],
  female: ['Tzniut Tradicional', 'Elegante Chabad', 'Sefardi Modesta', 'Moderno Tzniut', 'Saia e Blusa', 'Vestido Yeshiva']
};

const HEAD_ACCESSORIES = {
  male: ['Kippá', 'Chapéu Fedora', 'Shtreimel', 'Kippá de Crochê', 'Boina', 'Sem Acessório'],
  female: ['Mitpachat (Lenço)', 'Tichel', 'Turbante Elegante', 'Faixa de Cabelo', 'Boina Tzniut', 'Sem Acessório']
};

const AvatarCreationView: React.FC<AvatarCreationViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState({
    name: '',
    gender: 'Homem',
    skinTone: SKIN_TONES[1],
    hairStyle: 'Pequeno',
    hairColor: HAIR_COLORS[2],
    beardStyle: 'Sem barba',
    beardColor: HAIR_COLORS[2],
    clothing: 'Tradicional',
    accessory: 'Kippá'
  });

  const isMale = config.gender === 'Homem' || config.gender === 'Menino';
  const hasBeardOption = config.gender === 'Homem'; // Apenas homens adultos têm barba nas opções

  const handleNext = () => step < 4 && setStep(step + 1);
  const handleBack = () => step > 1 && setStep(step - 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = async () => {
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt mestre otimizado para preencher todo o banner
    const promptParts = [
      `A CINEMATIC WIDE PANORAMIC 3D Disney/Pixar style illustration of a ${config.gender}.`,
      `The character has ${config.skinTone} skin tone.`,
      `Hair style: ${config.hairStyle}, Hair color: ${config.hairColor}.`,
      hasBeardOption ? `Beard style: ${config.beardStyle}, Beard color: ${config.beardColor}.` : `No facial hair.`,
      `Clothing: ${config.clothing} (Jewish traditional/modest style).`,
      `Accessory: ${config.accessory}.`,
      userPhoto ? `Facial resemblance to the provided reference photo.` : "",
      `COMPOSITION: Wide cinematic shot. The character is standing on the FAR RIGHT side of the frame.`,
      `BACKGROUND: A beautiful, atmospheric minimalist sacred environment with a soft midnight-blue to golden gradient. The LEFT side of the frame is clean and empty to accommodate UI text.`,
      `MASTERPIECE QUALITY: 3D render, Pixar-style eyes, subsurface scattering on skin, magical particles, depth of field. Mature facial features, epic atmosphere, dignified, not childish.`,
      `Dimensions: Wide aspect for a web banner.`
    ];

    const finalPrompt = promptParts.join(" ");

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { text: finalPrompt },
            ...(userPhoto ? [{ inlineData: { data: userPhoto.split(',')[1], mimeType: 'image/jpeg' } }] : [])
          ] 
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9" // Aspect ratio ideal para banners de dashboard
          }
        }
      });

      let finalUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            finalUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      const newUser: UserProfile = {
        name: config.name || "Explorador",
        level: 1,
        xp: 0,
        sparks: 50,
        hearts: 5,
        merits: [],
        stickers: [],
        avatarUrl: finalUrl || "https://picsum.photos/seed/fallback/1200/450",
        avatarConfig: config,
        portalStats: {
          [PortalType.NOAHIDE]: { questionsAnswered: 0, correctAnswers: 0 },
          [PortalType.PSHAT]: { questionsAnswered: 0, correctAnswers: 0 },
          [PortalType.REMEZ]: { questionsAnswered: 0, correctAnswers: 0 },
          [PortalType.DRASH]: { questionsAnswered: 0, correctAnswers: 0 },
          [PortalType.PARASHA]: { questionsAnswered: 0, correctAnswers: 0 },
          [PortalType.SOD]: { questionsAnswered: 0, correctAnswers: 0 }
        }
      };
      
      onComplete(newUser);
    } catch (error) {
      console.error("Erro na Criação Celestial:", error);
      alert("Houve uma interferência mística ao gerar seu avatar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] block">Nome do Jogador</label>
              <input 
                type="text" 
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                placeholder="Gustavo Chaves"
                className="w-full bg-slate-900/40 border border-white/10 p-5 rounded-2xl focus:border-yellow-500/50 outline-none text-xl transition-all shadow-inner"
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] block">Gênero</label>
              <div className="grid grid-cols-2 gap-4">
                {['Homem', 'Mulher', 'Menino', 'Menina'].map(g => (
                  <button 
                    key={g}
                    onClick={() => setConfig({...config, gender: g})}
                    className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${config.gender === g ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.2)] scale-[1.02]' : 'border-white/5 bg-slate-900/40 hover:bg-white/5'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2 animate-in fade-in duration-500">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Tom de Pele</label>
              <div className="flex justify-center gap-4">
                {SKIN_TONES.map(t => (
                  <button 
                    key={t}
                    onClick={() => setConfig({...config, skinTone: t})}
                    style={{ backgroundColor: t }}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${config.skinTone === t ? 'border-yellow-500 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-slate-800'}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Estilo do Cabelo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Sem cabelo', 'Pequeno', 'Médio', 'Grande'].map(s => (
                  <button key={s} onClick={() => setConfig({...config, hairStyle: s})} className={`p-4 rounded-xl border-2 text-xs font-bold uppercase transition-all ${config.hairStyle === s ? 'border-yellow-500/50 bg-yellow-500/20 shadow-lg' : 'border-white/5 bg-slate-900/40'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Cor do Cabelo</label>
              <div className="flex justify-center gap-4">
                {HAIR_COLORS.map(c => (
                  <button key={c} onClick={() => setConfig({...config, hairColor: c})} style={{ backgroundColor: c }} className={`w-10 h-10 rounded-full border-4 transition-all ${config.hairColor === c ? 'border-yellow-500 scale-110' : 'border-slate-800'}`} />
                ))}
              </div>
            </div>

            {hasBeardOption && (
              <>
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Barba</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Sem barba', 'Pequena', 'Média', 'Grande'].map(s => (
                      <button key={s} onClick={() => setConfig({...config, beardStyle: s})} className={`p-4 rounded-xl border-2 text-xs font-bold uppercase transition-all ${config.beardStyle === s ? 'border-yellow-500/50 bg-yellow-500/20' : 'border-white/5 bg-slate-900/40'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Cor da Barba</label>
                  <div className="flex justify-center gap-4">
                    {HAIR_COLORS.map(c => (
                      <button key={c} onClick={() => setConfig({...config, beardColor: c})} style={{ backgroundColor: c }} className={`w-10 h-10 rounded-full border-4 transition-all ${config.beardColor === c ? 'border-yellow-500 scale-110' : 'border-slate-800'}`} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 3:
        const clothes = isMale ? CLOTHING_OPTIONS.male : CLOTHING_OPTIONS.female;
        const accs = isMale ? HEAD_ACCESSORIES.male : HEAD_ACCESSORIES.female;
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Estilo de Roupa</label>
              <div className="grid grid-cols-2 gap-3">
                {clothes.map(c => (
                  <button key={c} onClick={() => setConfig({...config, clothing: c})} className={`p-5 rounded-2xl border-2 text-sm font-bold transition-all shadow-lg ${config.clothing === c ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5 bg-slate-900/40'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block text-center">Acessórios de Cabeça</label>
              <div className="grid grid-cols-2 gap-3">
                {accs.map(a => (
                  <button key={a} onClick={() => setConfig({...config, accessory: a})} className={`p-5 rounded-2xl border-2 text-sm font-bold transition-all shadow-lg ${config.accessory === a ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/5 bg-slate-900/40'}`}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 py-4 animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-[6px] border-yellow-500/20 p-1.5 relative group overflow-hidden bg-slate-950 shadow-[0_0_60px_rgba(234,179,8,0.1)]">
                  <div className="w-full h-full rounded-full border-2 border-yellow-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                    {userPhoto ? (
                      <img src={userPhoto} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <i className="fas fa-user text-5xl text-white/10"></i>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <i className="fas fa-camera text-2xl"></i>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-[1px] border-dashed border-yellow-500/40 rounded-full animate-spin-slow pointer-events-none"></div>
                </div>
                
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-yellow-500/30 px-4 py-1.5 rounded-full shadow-xl">
                   <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest whitespace-nowrap">Foto do Rosto (Opcional)</p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-[11px] text-white/40 leading-relaxed max-w-[250px] mx-auto">Usado apenas para melhorar a semelhança do avatar.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                >
                  <i className="fas fa-star mr-2"></i> {userPhoto ? "Alterar Foto" : "Enviar Foto"}
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-yellow-500/20 bg-slate-950/60 p-8 shadow-2xl relative">
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950 px-6 py-1 border-x border-t border-yellow-500/20 rounded-t-xl">
                  <h5 className="text-[11px] uppercase font-bold tracking-[0.3em] text-yellow-500">Resumo do Avatar</h5>
               </div>
               
               <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                     <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Nome:</span>
                     <span className="text-sm font-bold text-yellow-500">{config.name || "Gustavo Chaves"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                     <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Gênero:</span>
                     <span className="text-sm font-bold text-white/90">{config.gender}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Estilo:</span>
                     <span className="text-sm font-bold text-white/90">{config.clothing}</span>
                  </div>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center py-16 px-6">
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-yellow-500/10 to-transparent blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] border border-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] border border-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mb-12 space-y-3 relative z-10 animate-in fade-in zoom-in duration-700">
        <h2 className="font-cinzel text-5xl font-bold text-yellow-500/90 drop-shadow-[0_0_25px_rgba(234,179,8,0.4)]">Crie seu Avatar</h2>
        <p className="text-white/40 tracking-[0.3em] uppercase text-xs font-medium">Personalize sua jornada na Torá</p>
      </header>

      <div className="flex items-center gap-6 mb-16 relative z-10">
        {[1, 2, 3, 4].map(i => (
          <React.Fragment key={i}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl border-2 transition-all duration-700 relative ${step >= i ? 'border-orange-500 bg-slate-900 shadow-[0_0_25px_rgba(249,115,22,0.5)]' : 'border-white/10 bg-slate-900/40 text-white/20'}`}>
              <div className={`absolute inset-0 rounded-full ${step === i ? 'animate-ping bg-orange-500/20' : ''}`}></div>
              {step > i ? <i className="fas fa-check text-orange-500"></i> : <span className={step >= i ? 'text-white' : ''}>{i}</span>}
            </div>
            {i < 4 && <div className={`h-[3px] w-12 rounded-full transition-all duration-700 ${step > i ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-white/10'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <Card className="w-full max-w-xl p-8 lg:p-14 border-white/10 bg-slate-900/60 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10 min-h-[550px] flex flex-col justify-between rounded-[40px] border-t-white/20">
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-500/20 rounded-b-full blur-sm"></div>
        
        <div className="flex-1">
           {renderStep()}
        </div>

        <div className="flex items-center justify-between mt-12 pt-10 border-t border-white/5">
          <button 
            onClick={handleBack} 
            disabled={step === 1 || loading}
            className="flex items-center gap-3 text-white/40 hover:text-white disabled:opacity-0 transition-all uppercase tracking-widest text-[11px] font-bold group"
          >
            <i className="fas fa-chevron-left group-hover:-translate-x-1 transition-transform"></i> Voltar
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="px-12 py-5 bg-gradient-to-r from-yellow-600/80 via-yellow-500/80 to-yellow-400/80 hover:from-yellow-500 hover:to-yellow-300 text-slate-950 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-[0_15px_30px_rgba(234,179,8,0.2)] flex items-center gap-3 group border border-white/20"
            >
              Próximo <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          ) : (
            <button 
              onClick={generateAvatar}
              disabled={loading}
              className="px-14 py-5 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-[length:200%_auto] hover:bg-right text-slate-950 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-[0_20px_40px_rgba(234,179,8,0.3)] flex items-center gap-3 border border-white/20 animate-shimmer"
            >
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-sparkles"></i>}
              {loading ? "Invocando..." : "Criar Avatar"}
            </button>
          )}
        </div>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative w-48 h-48 mb-12">
             <div className="absolute inset-0 border-[6px] border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin"></div>
             <div className="absolute inset-4 border-[6px] border-purple-500/10 border-t-purple-500 rounded-full animate-spin-slow"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <i className="fas fa-scroll text-4xl text-yellow-500/50 animate-pulse"></i>
             </div>
          </div>
          <div className="text-center space-y-4 max-w-sm px-6">
            <h3 className="font-cinzel text-4xl text-yellow-500 tracking-[0.4em] uppercase animate-pulse drop-shadow-lg">Selo de Sabedoria</h3>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-yellow-500 animate-shimmer w-[60%] rounded-full"></div>
            </div>
            <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] leading-relaxed">A IA está pintando sua jornada em 3D Pixar Cinematográfico. Aguarde a revelação...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarCreationView;