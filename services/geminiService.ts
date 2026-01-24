
import { GoogleGenAI, Type } from "@google/genai";
import { PortalType, Question, Rarity } from '../types';

const getSystemInstruction = (portal: PortalType) => {
  switch (portal) {
    case PortalType.PSHAT:
      return `Você é um mestre em Pshat (interpretação literal). Gere perguntas sobre a narrativa clara da Torá, gramática hebraica básica e contexto histórico.`;
    case PortalType.REMEZ:
      return `Você é um especialista em Remez (alusões). Gere perguntas sobre Gematria, Notarikon e segredos linguísticos.`;
    case PortalType.DRASH:
      return `Você é um mestre em Drash (homilética). Gere perguntas baseadas em Midrash, Talmud e parábolas éticas.`;
    case PortalType.SOD:
      return `Você é um mestre em Sod (segredos). Gere perguntas sobre Cabalá, Zohar e a estrutura das Sefirot.`;
    case PortalType.NOAHIDE:
      return `Você é um instrutor das Sete Leis de Noé. Gere perguntas sobre ética universal para a humanidade.`;
    default:
      return `Gere perguntas sobre sabedoria judaica.`;
  }
};

export const generateQuizQuestion = async (portal: PortalType, level: number): Promise<Question> => {
  const difficulty = Math.min(5, Math.floor(level / 10) + 1);
  const questions = await generateQuestionBatch(portal, 1, difficulty);
  
  if (!questions || questions.length === 0) {
    throw new Error("Falha ao gerar pergunta via IA.");
  }

  const q = questions[0];
  return {
    id: Math.random().toString(36).substring(7),
    portal,
    difficulty: q.difficulty ?? difficulty,
    text: q.text ?? "Pergunta não gerada corretamente.",
    options: q.options ?? ["Erro A", "Erro B", "Erro C", "Erro D"],
    correctAnswer: q.correctAnswer ?? 0,
    explanation: q.explanation ?? "Sem explicação disponível.",
    xpReward: q.xpReward ?? 50
  };
};

export const syncParashaWithChabad = async (): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const prompt = `Utilize o Google Search para encontrar a Parashá da semana atual no site pt.chabad.org.
  Extraia: Nome PT, Nome HE, Referência Bíblica, Resumo Teológico, Frase Espiritual e Versículo Chave. Retorne em JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name_pt: { type: Type.STRING },
            name_he: { type: Type.STRING },
            reference: { type: Type.STRING },
            summary: { type: Type.STRING },
            spiritual_phrase: { type: Type.STRING },
            key_verse: { type: Type.STRING }
          },
          required: ["name_pt", "name_he", "summary", "spiritual_phrase"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro Sync Chabad:", error);
    return null;
  }
};

export const generateQuestionBatch = async (portal: PortalType, count: number = 10, difficulty: number = 1): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const instruction = getSystemInstruction(portal);
  const prompt = `${instruction} Gere ${count} perguntas de múltipla escolha. Dificuldade ${difficulty}/5. Retorne um array JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              xpReward: { type: Type.INTEGER },
              difficulty: { type: Type.INTEGER }
            },
            required: ["text", "options", "correctAnswer", "explanation", "xpReward", "difficulty"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Erro ao gerar batch de questões:", e);
    return [];
  }
};

export const generateStickerAI = async (theme: string, rarity: string): Promise<{frontUrl: string, description: string}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let description = "Uma centelha sagrada de sabedoria.";
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie uma descrição mística e educativa para uma figurinha colecionável sobre "${theme}". Raridade: ${rarity}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { description: { type: Type.STRING } },
          required: ["description"]
        }
      }
    });
    const parsed = JSON.parse(textResponse.text || '{}');
    description = parsed.description || description;
  } catch (e) {
    console.error("Erro ao gerar descrição do adesivo:", e);
  }

  const promptImg = `A cinematic 3D Pixar style illustration of ${theme}. Jewish sacred theme, floating particles, midnight background. High quality 3D render.`;
  const imgResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: promptImg }] },
    config: { imageConfig: { aspectRatio: "3:4" } }
  });

  let frontUrl = "";
  if (imgResponse.candidates?.[0]?.content?.parts) {
    for (const part of imgResponse.candidates[0].content.parts) {
      if (part.inlineData) frontUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return { frontUrl, description };
};

export const generateMeritBadge = async (name: string, desc: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A circular golden achievement badge for "${name}". Theme: ${desc}. Ornamental Jewish design, high-end metallic relief, transparent background (emulate with dark slate), 3D render.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateParashaBannerAI = async (name: string, summary: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A wide cinematic illustration for the Torah portion "${name}". Theme: ${summary.substring(0, 100)}. Modern Jewish artistic style, vibrant spiritual colors, dark background, symbolic elements. Dimensions 1200x400 aspect ratio.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
