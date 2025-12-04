import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Character, Panel, StyleType, GenreType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip markdown code blocks if present
const cleanJson = (text: string) => {
  const match = text.match(/```json([\s\S]*?)```/);
  return match ? match[1].trim() : text;
};

export const generateStoryIdeas = async (
  style: StyleType,
  genre: GenreType
): Promise<string[]> => {
  const prompt = `
    4컷 만화를 위한 독창적이고 재미있는 스토리 아이디어 5개를 제안해주세요.
    스타일: ${style}
    장르: ${genre}
    
    결과는 반드시 JSON 문자열 배열 형식이어야 합니다. 
    각 문자열은 스토리를 한 문장으로 요약한 한국어 문장이어야 합니다.
    예시: ["코딩을 배우는 강아지의 좌충우돌 이야기", "오늘 저녁 메뉴를 두고 다투는 커플의 로맨스"]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const jsonStr = cleanJson(response.text || "[]");
  return JSON.parse(jsonStr);
};

export const generateScript = async (
  style: StyleType,
  genre: GenreType,
  prompt: string
): Promise<{ characters: Character[]; panels: Panel[] }> => {
  
  const systemInstruction = `당신은 전문 웹툰 작가입니다. 
  사용자의 요청에 따라 재미있고 매력적인 4컷 만화 대본을 작성하세요.
  
  규칙:
  1. 반드시 JSON 형식으로 출력하세요.
  2. 정확히 4개의 컷(panel)을 구성하세요.
  3. 모든 등장인물 설명, 장면 묘사, 대사는 '한국어'로 작성하세요.
  4. 등장인물 묘사는 외모(머리스타일, 옷, 특징 등)를 구체적으로 묘사하세요.
  `;

  const userPrompt = `
    스타일: ${style}
    장르: ${genre}
    스토리 아이디어: ${prompt}

    다음 구조를 가진 JSON을 생성하세요:
    {
      "characters": [
        { "name": "이름", "description": "구체적인 외모 묘사" }
      ],
      "panels": [
        {
          "panel_number": 1,
          "scene_description": "구체적인 장면 묘사",
          "dialogue": [
            { "speaker": "이름", "text": "대사" }
          ]
        }
      ]
    }
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      characters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "description"]
        }
      },
      panels: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            panel_number: { type: Type.INTEGER },
            scene_description: { type: Type.STRING },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["speaker", "text"]
              }
            }
          },
          required: ["panel_number", "scene_description", "dialogue"]
        }
      }
    },
    required: ["characters", "panels"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const jsonStr = cleanJson(response.text || "{}");
  const data = JSON.parse(jsonStr);

  return {
    characters: data.characters.map((c: any, i: number) => ({
      id: `char_${i}`,
      name: c.name,
      description: c.description,
    })),
    panels: data.panels.map((p: any) => ({
      id: p.panel_number,
      description: p.scene_description,
      dialogues: p.dialogue,
    })),
  };
};

export const generateImage = async (
  prompt: string,
  style: string
): Promise<string> => {
  const finalPrompt = `${style} style. ${prompt}. High quality, detailed, anime/webtoon aesthetic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: finalPrompt,
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateCharacterImage = async (
  character: Character,
  style: string
): Promise<string> => {
  return generateImage(
    `Character design sheet for ${character.name}. ${character.description}. Full body, white background.`,
    style
  );
};

export const generatePanelImage = async (
  panel: Panel,
  characters: Character[],
  style: string
): Promise<string> => {
  // Construct a prompt that includes character visual details to maintain consistency
  const characterContext = characters
    .map(c => `${c.name} is ${c.description}`)
    .join('. ');

  const prompt = `Panel ${panel.id}. Scene: ${panel.description}. Characters: [${characterContext}]. Action shot, dynamic composition.`;
  return generateImage(prompt, style);
};