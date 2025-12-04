import React from 'react';
import { ComicState, Character } from '../types';
import { Button } from './Button';

interface Props {
  data: ComicState;
  onGenerateAllCharacters: () => void;
  onGenerateSingleCharacter: (char: Character) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Characters: React.FC<Props> = ({
  data,
  onGenerateAllCharacters,
  onGenerateSingleCharacter,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">등장인물 확인 및 생성</h2>
        <Button variant="outline" onClick={onBack}>이전 단계로</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.characters.map((char) => (
          <div key={char.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-bold text-lg">{char.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-3">{char.description}</p>
            </div>
            
            <div className="flex-1 min-h-[250px] bg-gray-100 flex items-center justify-center relative group">
              {char.imageUrl ? (
                <img 
                  src={char.imageUrl} 
                  alt={char.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <span className="text-4xl mb-2">👤</span>
                  <span className="text-sm">이미지 없음</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  onClick={() => onGenerateSingleCharacter(char)}
                  disabled={data.isGenerating}
                  variant="secondary"
                  className="text-sm"
                >
                   {char.imageUrl ? '다시 생성' : '이미지 생성'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center pt-8 border-t">
         <Button 
           variant="secondary" 
           onClick={onGenerateAllCharacters}
           isLoading={data.isGenerating}
           disabled={data.isGenerating}
         >
           모든 캐릭터 한번에 생성
         </Button>
         
         <Button 
           variant="primary" 
           onClick={onNext}
           disabled={data.isGenerating}
           className="px-12"
         >
           만화 생성하러 가기
         </Button>
      </div>
    </div>
  );
};