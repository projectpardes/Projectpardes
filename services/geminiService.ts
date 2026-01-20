
import { GoogleGenAI, Type } from "@google/genai";
import { PortalType, Question } from '../types';

// Removed global ai instance to ensure fresh initialization per API call as per strict guidelines.

const getSystemInstruction = (portal: PortalType) => {
  switch (portal) {
    case PortalType.PSHAT:
      return `Você é um mestre em Pshat (interpretação literal). Gere perguntas sobre a narrativa clara da Torá, gramática hebraica básica e o contexto histórico dos eventos do Tanakh, focando nos comentários de Rashi e no "peshat" do texto. NÃO defina o que é Pshat.`;
    case PortalType.REMEZ:
      return `Você é um especialista em Remez (alusões). Gere perguntas sobre Gematria (valores numéricos), acrônimos (Notarikon), e dicas sutis no texto bíblico que apontam para significados paralelos. Use exemplos reais de conexões entre palavras. NÃO defina o que é Remez.`;
    case PortalType.DRASH:
      return `Você é um mestre em Drash (homilética). Gere perguntas baseadas em parábolas do Midrash, ensinamentos do Talmud, lições de ética do Pirkei Avot e interpretações alegóricas que extraem lições morais do texto. NÃO defina o que é Drash.`;
    case PortalType.SOD:
      return `Você é um mestre em Sod (segredos). Gere perguntas profundas sobre a Cabalá, o Zohar, a estrutura das Sefirot e o significado espiritual das letras hebraicas e da Alma. Foco na luz oculta e na cosmologia mística. NÃO defina o que é Sod.`;
    case PortalType.NOAHIDE:
      return `Você é um instrutor das Sete Leis de Noé. Gere perguntas sobre ética universal, as leis para a humanidade e o pacto de D'us com Noé, utilizando o código de conduta bnei noach.`;
    default:
      return `Gere perguntas sobre sabedoria judaica e Torá.`;
  }
};

export const generateQuizQuestion = async (portal: PortalType, level: number): Promise<Question> => {
  // FIX: Create new instance right before making the API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const instruction = getSystemInstruction(portal);
  
  const prompt = `${instruction}
  Gere uma pergunta de múltipla escolha para um nível de dificuldade ${level}.
  A pergunta deve ser em português, profunda, educativa e baseada na Parashá da semana ou em literatura clássica (Tanakh, Talmud, Zohar).
  REGRAS CRÍTICAS: 
  - NUNCA pergunte o significado da palavra "${portal}".
  - Foque no conteúdo prático/teológico da literatura associada a este nível.
  - A explicação deve ser um ensinamento rico que adicione conhecimento ao usuário.
  Retorne em JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
              // Removed minItems/maxItems as they are not standard Type properties.
            },
            correctAnswer: { type: Type.INTEGER, description: "Index 0 a 3" },
            explanation: { type: Type.STRING },
            xpReward: { type: Type.INTEGER }
          },
          required: ["text", "options", "correctAnswer", "explanation", "xpReward"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      id: Math.random().toString(36).substr(2, 9),
      portal,
      difficulty: level,
      ...data
    };
  } catch (error) {
    console.error("Erro ao gerar pergunta:", error);
    return {
      id: 'fallback',
      portal,
      difficulty: level,
      text: "No início de Bereshit, qual foi a primeira criação de D'us antes da luz material?",
      options: ["A Torá", "Os Anjos", "O Trono Celestial", "O Tempo"],
      correctAnswer: 0,
      explanation: "De acordo com a tradição sábia, a Torá foi o projeto usado por D'us para criar o mundo, existindo antes da criação material.",
      xpReward: 100
    };
  }
};

export const generateQuestionBatch = async (portal: PortalType, count: number = 10): Promise<any[]> => {
  // FIX: Create new instance right before making the API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const instruction = getSystemInstruction(portal);

  const prompt = `${instruction}
  Gere exatamente ${count} perguntas de múltipla escolha de alta qualidade.
  As perguntas devem cobrir diversos temas dentro deste portal, variando entre fácil e avançado.
  Mantenha o tom solene, místico e educativo.
  Retorne um array de objetos JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
                // Removed minItems/maxItems as they are not standard Type properties.
              },
              correctAnswer: { type: Type.INTEGER, description: "Index 0 a 3" },
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
  } catch (error) {
    console.error("Erro ao gerar lote de perguntas:", error);
    return [];
  }
};

export const generateAdminText = async (type: 'parasha' | 'merit' | 'sticker', context: string) => {
  // FIX: Create new instance right before making the API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  let prompt = "";
  let schema: any = {};

  if (type === 'parasha') {
    prompt = `Gere detalhes teológicos profundos para a Parashá "${context}". 
    Forneça uma frase espiritual curta e impactante e um resumo educativo denso que explore aspectos morais e místicos da porção semanal.`;
    schema = {
      type: Type.OBJECT,
      properties: {
        spiritualPhrase: { type: Type.STRING },
        summary: { type: Type.STRING }
      },
      required: ["spiritualPhrase", "summary"]
    };
  } else if (type === 'merit') {
    prompt = `Crie um nome baseado em títulos honoríficos ou conceitos da Torá (ex: 'Guardião da Aliança', 'Buscador de Centelhas') e uma descrição motivadora para um mérito sobre o tema: "${context}".`;
    schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "description"]
    };
  } else {
    prompt = `Crie um nome e uma descrição para uma figurinha colecionável que represente um objeto sagrado ou sábio histórico do tema: "${context}".`;
    schema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "description"]
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text || '{}');
};

export const generateAdminImage = async (description: string, aspectRatio: "1:1" | "16:9" | "4:3" | "3:4" | "9:16" = "1:1") => {
  // FIX: Create new instance right before making the API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promptText = `A cinematic 3D Pixar style illustration of: ${description}. 
  Context: Sacred Jewish Art, Biblical aesthetic, vibrant but respectful lighting, gold and blue accents.
  NO TEXT, NO BORDERS. High-end rendering style like Disney Masterpieces.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    // FIX: Recommended structure for generateContent using image models.
    contents: { parts: [{ text: promptText }] },
    config: { 
      imageConfig: { 
        aspectRatio 
      } 
    }
  });

  // Iterating through parts as recommended for image generation responses.
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};
