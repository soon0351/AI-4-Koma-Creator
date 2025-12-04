import React, { useState } from 'react';
import { StyleType, GenreType, ComicState } from '../types';
import { Button } from './Button';
import { generateStoryIdeas } from '../services/geminiService';

interface Props {
  data: ComicState;
  onChange: (updates: Partial<ComicState>) => void;
  onNext: () => void;
}

export const Step1Selection: React.FC<Props> = ({ data, onChange, onNext }) => {
  const styles = Object.values(StyleType);
  const genres = Object.values(GenreType);

  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  const isReady = data.storyPrompt.length > 5;

  const handleGenerateIdeas = async () => {
    setIsLoadingIdeas(true);
    try {
      const suggestions = await generateStoryIdeas(data.style, data.genre);
      setIdeas(suggestions);
    } catch (error) {
      console.error(error);
      alert("주제 추천 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">Step 1</span>
          그림 스타일 선택
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => onChange({ style: s })}
              className={`p-3 rounded-lg text-sm border transition-all ${
                data.style === s
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center">
           <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">Step 2</span>
           만화 장르 선택
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => onChange({ genre: g })}
              className={`p-3 rounded-lg text-sm border text-left transition-all ${
                data.genre === g
                  ? 'bg-purple-50 border-purple-500 text-purple-700 font-semibold ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-purple-300 text-gray-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl font-bold flex items-center">
             <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">Step 3</span>
             스토리 박스
          </h2>
          <Button 
            variant="secondary" 
            onClick={handleGenerateIdeas}
            isLoading={isLoadingIdeas}
            disabled={isLoadingIdeas}
            className="text-sm py-1 px-3 h-9"
          >
            ✨ AI 주제 추천/갱신
          </Button>
        </div>
        
        {ideas.length > 0 && (
          <div className="mb-4 animate-fade-in">
            <select 
              className="w-full p-2 border border-purple-200 bg-purple-50 rounded-lg text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={(e) => {
                if (e.target.value) {
                  onChange({ storyPrompt: e.target.value });
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>🤖 AI 추천 주제를 선택하세요 (클릭하여 아래에 적용)</option>
              {ideas.map((idea, idx) => (
                <option key={idx} value={idea}>
                  {idx + 1}. {idea}
                </option>
              ))}
            </select>
            <p className="text-xs text-purple-600 mt-1 ml-1">👆 추천 주제를 선택하면 아래 입력창에 자동으로 입력됩니다.</p>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            직접 주제 입력 (또는 위에서 선택):
          </label>
          <textarea
            value={data.storyPrompt}
            onChange={(e) => onChange({ storyPrompt: e.target.value })}
            placeholder="예시) 경제위기속에서 한국 남녀의 부동산 고민을 해결하는 로맨스"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
          />
          <p className="text-sm text-gray-500 mt-2 text-right">
            {data.storyPrompt.length}/5글자 이상 입력해주세요
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button 
          onClick={onNext} 
          disabled={!isReady || data.isGenerating}
          isLoading={data.isGenerating}
          className="w-full md:w-auto text-lg py-3 px-8 shadow-md"
        >
          {data.isGenerating ? '대본 생성 중...' : '이 주제로 대본 생성하기'}
        </Button>
      </div>
    </div>
  );
};