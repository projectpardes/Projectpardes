
import React, { useState, useEffect } from 'react';
import { PortalType, Question, UserProfile } from '../types';
import { generateQuizQuestion } from '../services/geminiService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PORTAL_THEMES } from '../constants';
import { soundManager, SFX } from '../services/soundService';
import VictoryView from './VictoryView';
import { supabase } from '../lib/supabase';

interface QuizViewProps {
  user: UserProfile;
  portal: PortalType;
  questionLimit: number;
  onFinish: (xp: number) => void;
  onClose: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ user, portal, questionLimit, onFinish, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [prefetchedQuestions, setPrefetchedQuestions] = useState<any[]>([]);

  const theme = PORTAL_THEMES[portal];

  const getTargetTable = (p: PortalType) => {
    switch(p) {
      case PortalType.PSHAT: return 'pshat_questions';
      case PortalType.REMEZ: return 'remez_questions';
      case PortalType.DRASH: return 'drash_questions';
      case PortalType.SOD: return 'sod_questions';
      case PortalType.NOAHIDE: return 'nohide_questions';
      default: return 'pshat_questions';
    }
  };

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const tableName = getTargetTable(portal);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(questionLimit);
      
      if (error) throw error;

      if (data && data.length > 0) {
        setPrefetchedQuestions(data);
        loadQuestionFromBatch(data, 0);
      } else {
        await loadNewAIQuestion();
      }
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      await loadNewAIQuestion();
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionFromBatch = (batch: any[], index: number) => {
    if (index < batch.length) {
      const q = batch[index];
      setQuestion({
        id: q.id,
        portal: portal,
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        xpReward: q.xp_reward
      });
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      loadNewAIQuestion();
    }
  };

  const loadNewAIQuestion = async () => {
    setLoading(true);
    try {
      const q = await generateQuizQuestion(portal, user.level);
      setQuestion(q);
    } catch (error) { console.error(error); }
    finally {
      setLoading(false);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question?.correctAnswer) {
      setScore(s => s + (question?.xpReward || 0));
      soundManager.play(SFX.SUCCESS);
    } else {
      soundManager.play(SFX.ERROR);
    }
    setQuestionCount(c => c + 1);
  };

  const handleNext = () => {
    soundManager.play(SFX.CLICK);
    if (questionCount >= questionLimit) {
      setShowVictory(true);
    } else {
      if (prefetchedQuestions.length > questionCount) {
        loadQuestionFromBatch(prefetchedQuestions, questionCount);
      } else {
        loadNewAIQuestion();
      }
    }
  };

  if (showVictory) {
    return (
      <VictoryView 
        xpEarned={score} 
        sparksEarned={Math.floor(score / 10)} 
        onContinue={() => onFinish(score)} 
        onReplay={() => {
          setScore(0);
          setQuestionCount(0);
          setShowVictory(false);
          startQuiz();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 bg-[#020617]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/5 border-t-yellow-500 rounded-full animate-spin"></div>
          <i className="fas fa-scroll absolute inset-0 flex items-center justify-center text-yellow-500 text-2xl animate-pulse"></i>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-cinzel text-yellow-500 tracking-[0.3em] uppercase">Buscando Verdade</h2>
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold max-w-xs mx-auto">"O portal do {portal === PortalType.NOAHIDE ? 'Sete Leis' : portal} está se abrindo..."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-transparent animate-in fade-in duration-700 overflow-hidden">
      <nav className="p-6 lg:px-12 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-xl z-50">
        <button onClick={() => { soundManager.play(SFX.CLICK); onClose(); }} className="p-3 glass rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 group">
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> 
          <span className="text-[10px] font-bold uppercase tracking-widest">Abandonar</span>
        </button>
        <div className="text-center">
            <h2 className={`font-cinzel text-2xl ${theme.accent} uppercase tracking-[0.4em]`}>{portal === PortalType.NOAHIDE ? 'Sete Leis' : portal}</h2>
            <div className="flex flex-col items-center gap-2 mt-2">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">{questionCount} / {questionLimit}</span>
            </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">XP Ganho</p>
            <p className="font-cinzel text-xl text-yellow-500 font-bold">+{score}</p>
          </div>
          <div className="w-12 h-12 glass rounded-full flex items-center justify-center text-red-500 border border-red-500/10">
            <i className="fas fa-heart animate-pulse"></i>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-6 lg:p-12 flex flex-col items-center custom-scrollbar">
        {question && (
          <div className="w-full max-w-3xl py-12 space-y-10 animate-in slide-in-from-bottom-12 duration-1000">
            <Card className="p-12 border-white/10 bg-slate-900/60 relative overflow-hidden">
              <span className={`${theme.accent} opacity-50 font-cinzel text-[10px] uppercase tracking-[0.5em] mb-6 block font-bold`}>Pergunta {questionCount + 1}</span>
              <h3 className="text-2xl lg:text-3xl font-medium leading-snug text-white/90">{question.text}</h3>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correctAnswer;
                const isSelected = i === selectedAnswer;
                let style = "border-white/5 bg-slate-900/30 hover:bg-white/5";

                if (showResult) {
                  if (isCorrect) style = "border-green-500 bg-green-500/20 text-green-400 scale-[1.02]";
                  else if (isSelected) style = "border-red-500 bg-red-500/20 text-red-400";
                  else style = "opacity-20";
                }

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleAnswer(i)}
                    className={`w-full p-8 rounded-3xl border text-left transition-all duration-500 transform active:scale-[0.97] group flex items-center gap-6 ${style}`}
                  >
                    <span className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center font-cinzel font-black text-xl border ${isSelected || isCorrect ? 'bg-current text-slate-950 border-transparent' : 'glass border-white/10 text-white/20'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-lg font-medium tracking-tight">{opt}</span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700 pb-20">
                <Card className="p-10 bg-slate-950/60 border-yellow-500/20 backdrop-blur-3xl">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0 text-yellow-500">
                      <i className="fas fa-scroll text-2xl"></i>
                    </div>
                    <div>
                      <h4 className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] mb-3">Ensinamento</h4>
                      <p className="text-xl text-white/70 italic leading-relaxed font-light">{question.explanation}</p>
                    </div>
                  </div>
                </Card>
                <Button variant="gold" className="w-full py-6 text-xl" onClick={handleNext}>
                  {questionCount >= questionLimit ? 'Finalizar Ascensão' : 'Próxima Revelação'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
