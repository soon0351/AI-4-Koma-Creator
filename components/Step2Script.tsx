import React from 'react';
import { ComicState, Panel, Dialogue } from '../types';
import { Button } from './Button';

interface Props {
  data: ComicState;
  onUpdatePanel: (id: number, updates: Partial<Panel>) => void;
  onUpdateDialogue: (panelId: number, dialogueIndex: number, text: string) => void;
  onNext: () => void;
  onBack: () => void;
  onRegenerate: () => void;
}

export const Step2Script: React.FC<Props> = ({
  data,
  onUpdatePanel,
  onUpdateDialogue,
  onNext,
  onBack,
  onRegenerate,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">대본 확인 및 수정</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>처음으로 돌아가기</Button>
          <Button variant="secondary" onClick={onRegenerate} isLoading={data.isGenerating}>대본 다시 생성</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {data.panels.map((panel, idx) => (
          <div key={panel.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <span className="font-bold text-lg text-gray-700">Panel {idx + 1}</span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">장면 묘사</label>
              <textarea
                value={panel.description}
                onChange={(e) => onUpdatePanel(panel.id, { description: e.target.value })}
                className="w-full p-2 border rounded-md text-sm bg-gray-50 focus:bg-white transition-colors"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">대사</label>
              {panel.dialogues.map((d, dIdx) => (
                <div key={dIdx} className="flex gap-2 items-start">
                  <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mt-2 w-20 text-center shrink-0">
                    {d.speaker}
                  </div>
                  <input
                    type="text"
                    value={d.text}
                    onChange={(e) => onUpdateDialogue(panel.id, dIdx, e.target.value)}
                    className="flex-1 p-2 border rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8 pb-12">
        <Button onClick={onNext} className="w-full md:w-1/2 text-lg py-4 shadow-lg shadow-blue-200">
          대본 확정 및 등장인물 생성
        </Button>
      </div>
    </div>
  );
};