import React, { useState } from 'react';
import { ComicState } from '../types';
import { Button } from './Button';
import { createCombinedImage, downloadCanvas } from '../utils/imageUtils';

interface Props {
  data: ComicState;
  onGenerateAllPanels: () => void;
  onGenerateSinglePanel: (panelId: number) => void;
  onBack: () => void;
}

export const Step4Comic: React.FC<Props> = ({
  data,
  onGenerateAllPanels,
  onGenerateSinglePanel,
  onBack,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleDownload = async (type: '2x2' | 'horizontal' | 'vertical' | 'individual') => {
    setIsSaving(true);
    try {
      // Filter out panels without images to avoid errors
      const validPanels = data.panels.filter(p => p.imageUrl);
      const images = validPanels.map(p => p.imageUrl as string);

      if (images.length === 0) {
        alert("생성된 이미지가 없습니다.");
        return;
      }

      if (type === 'individual') {
        validPanels.forEach(async (p, i) => {
           const canvas = await createCombinedImage([p.imageUrl!], 'vertical', [p]);
           downloadCanvas(canvas, `panel_${i+1}.png`);
        });
      } else {
        const canvas = await createCombinedImage(images, type, validPanels);
        downloadCanvas(canvas, `comic_${type}.png`);
      }
    } catch (e) {
      console.error(e);
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">최종 4컷 만화 생성</h2>
        <Button variant="outline" onClick={onBack}>이전 단계로</Button>
      </div>

      <div className="flex justify-center py-4">
        <Button 
          onClick={onGenerateAllPanels} 
          isLoading={data.isGenerating}
          disabled={data.isGenerating}
          className="w-full md:w-auto text-lg px-12 py-3 shadow-lg"
        >
          {data.panels.some(p => p.imageUrl) ? '모든 이미지 다시 생성' : '모든 이미지 한번에 생성'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.panels.map((panel, idx) => (
          <div key={panel.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col">
             <div className="mb-2 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">Panel {idx + 1}</span>
             </div>
             
             <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative group">
               {panel.imageUrl ? (
                 <img src={panel.imageUrl} alt={`Panel ${idx+1}`} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 flex-col gap-2">
                   <p className="text-3xl">🎨</p>
                   <p className="text-sm font-medium">이미지가 없습니다</p>
                 </div>
               )}
               
               {data.isGenerating && !panel.imageUrl && (
                 <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                   <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                 </div>
               )}
             </div>

             <div className="flex-grow space-y-2 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">대사:</p>
                {panel.dialogues.map((d, i) => (
                  <div key={i} className="flex text-sm bg-gray-50 p-2 rounded">
                    <span className="font-bold mr-2 text-gray-800 shrink-0">{d.speaker}:</span>
                    <span className="text-gray-600">{d.text}</span>
                  </div>
                ))}
             </div>

             <Button 
                onClick={() => onGenerateSinglePanel(panel.id)}
                disabled={data.isGenerating}
                variant="secondary"
                className="w-full mt-auto py-2 text-sm"
              >
                {panel.imageUrl ? '🔄 이미지 다시 생성' : '✨ 이 컷만 이미지 생성'}
             </Button>
          </div>
        ))}
      </div>

      {data.panels.every(p => p.imageUrl) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg-up z-50 animate-slide-up">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            <span className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-green-500">✔</span> 
              완성된 만화 저장하기:
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button onClick={() => handleDownload('2x2')} disabled={isSaving}>2x2 격자</Button>
              <Button onClick={() => handleDownload('horizontal')} disabled={isSaving}>가로 연속</Button>
              <Button onClick={() => handleDownload('vertical')} disabled={isSaving}>세로 연속</Button>
              <Button variant="outline" onClick={() => handleDownload('individual')} disabled={isSaving}>개별 파일</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};