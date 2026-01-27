
import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface ParashaDetailsViewProps {
  parasha?: any;
  onClose: () => void;
  onStartQuiz: () => void;
}

const ParashaDetailsView: React.FC<ParashaDetailsViewProps> = ({ parasha, onClose, onStartQuiz }) => {
  const banner = parasha?.banner_url || "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1200";
  const video = parasha?.video_url;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col pb-12 animate-in fade-in duration-500">
      <nav className="sticky top-0 z-50 p-6 flex items-center gap-4 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center glass rounded-full hover:bg-white/10 transition-all">
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="flex items-center gap-3">
          <i className="fas fa-book-open text-yellow-500"></i>
          <h2 className="font-bold text-lg tracking-tight">Sobre a Parashá</h2>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 w-full space-y-8 mt-6">
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl h-[400px]">
          {video ? (
            <video 
              src={video} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={banner} alt={parasha?.name_pt} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div className="absolute bottom-10 left-10">
            <h1 className="text-5xl font-bold font-cinzel text-white mb-2">{parasha?.name_pt || 'Shemot'}</h1>
            <p className="text-2xl font-cinzel text-yellow-500">{parasha?.name_he || 'שמות'}</p>
          </div>
        </div>

        <Card className="p-5 flex items-center gap-4 border-white/5 bg-slate-900/40">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
            <i className="fas fa-calendar"></i>
          </div>
          <p className="text-sm font-medium text-white/60">
            {parasha ? `${new Date(parasha.start_date).toLocaleDateString()} - ${new Date(parasha.end_date).toLocaleDateString()}` : 'Carregando datas...'}
          </p>
        </Card>

        <Card className="p-8 border-white/5 bg-slate-900/40 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <i className="fas fa-book text-yellow-500/50"></i>
             <h3 className="font-bold text-lg uppercase tracking-widest text-white/70">Resumo</h3>
          </div>
          <div className="text-white/70 leading-loose space-y-4 text-sm lg:text-base text-justify whitespace-pre-wrap">
            {parasha?.summary || 'Nenhum resumo disponível para esta parashá.'}
          </div>
        </Card>

        <Button variant="gold" className="w-full py-6 text-xl animate-pulse" onClick={onStartQuiz}>
          Começar Quiz sobre {parasha?.name_pt || 'Shemot'}
        </Button>
      </div>
    </div>
  );
};

export default ParashaDetailsView;
