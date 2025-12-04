import React, { useState } from 'react';
import { Step1Selection } from './components/Step1Selection';
import { Step2Script } from './components/Step2Script';
import { Step3Characters } from './components/Step3Characters';
import { Step4Comic } from './components/Step4Comic';
import { ComicState, StyleType, GenreType, Panel, Character } from './types';
import { generateScript, generateCharacterImage, generatePanelImage } from './services/geminiService';

const INITIAL_STATE: ComicState = {
  step: 1,
  style: StyleType.WEBTOON,
  genre: GenreType.DAILY_COMEDY,
  storyPrompt: '',
  characters: [],
  panels: [],
  isGenerating: false,
};

const App: React.FC = () => {
  const [state, setState] = useState<ComicState>(INITIAL_STATE);

  const updateState = (updates: Partial<ComicState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const goToStep = (step: number) => {
    // Only allow going back or to next available step if data exists
    if (step < state.step || (step === state.step + 1)) {
      updateState({ step });
    }
  };

  // Step 1 -> 2: Generate Script
  const handleGenerateScript = async () => {
    updateState({ isGenerating: true });
    try {
      const result = await generateScript(state.style, state.genre, state.storyPrompt);
      updateState({
        characters: result.characters,
        panels: result.panels,
        step: 2,
        isGenerating: false
      });
    } catch (error) {
      console.error(error);
      alert("대본 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      updateState({ isGenerating: false });
    }
  };

  // Step 2 Actions
  const handleUpdatePanel = (id: number, updates: Partial<Panel>) => {
    const newPanels = state.panels.map(p => p.id === id ? { ...p, ...updates } : p);
    updateState({ panels: newPanels });
  };

  const handleUpdateDialogue = (panelId: number, dIdx: number, text: string) => {
    const newPanels = state.panels.map(p => {
      if (p.id !== panelId) return p;
      const newDialogues = [...p.dialogues];
      newDialogues[dIdx] = { ...newDialogues[dIdx], text };
      return { ...p, dialogues: newDialogues };
    });
    updateState({ panels: newPanels });
  };

  // Step 3 Actions
  const handleGenerateCharacter = async (char: Character) => {
    updateState({ isGenerating: true });
    try {
      const imgUrl = await generateCharacterImage(char, state.style);
      const newChars = state.characters.map(c => c.id === char.id ? { ...c, imageUrl: imgUrl } : c);
      updateState({ characters: newChars, isGenerating: false });
    } catch (e) {
      console.error(e);
      alert("캐릭터 생성 실패");
      updateState({ isGenerating: false });
    }
  };

  const handleGenerateAllCharacters = async () => {
    updateState({ isGenerating: true });
    try {
      // Use map + Promise.all for concurrency
      const promises = state.characters.map(async (char) => {
        if (char.imageUrl) return char; // Skip if already exists
        const imgUrl = await generateCharacterImage(char, state.style);
        return { ...char, imageUrl: imgUrl };
      });
      
      const newChars = await Promise.all(promises);
      updateState({ characters: newChars, isGenerating: false });
    } catch (e) {
      console.error(e);
      alert("캐릭터 일괄 생성 중 일부 실패가 발생했습니다.");
      updateState({ isGenerating: false });
    }
  };

  // Step 4 Actions
  const handleGeneratePanel = async (panelId: number) => {
    updateState({ isGenerating: true });
    try {
      const panel = state.panels.find(p => p.id === panelId);
      if (!panel) return;

      const imgUrl = await generatePanelImage(panel, state.characters, state.style);
      const newPanels = state.panels.map(p => p.id === panelId ? { ...p, imageUrl: imgUrl } : p);
      updateState({ panels: newPanels, isGenerating: false });
    } catch (e) {
      console.error(e);
      alert("패널 생성 실패");
      updateState({ isGenerating: false });
    }
  };

  const handleGenerateAllPanels = async () => {
    updateState({ isGenerating: true });
    try {
      const promises = state.panels.map(async (p) => {
        if (p.imageUrl) return p;
        const imgUrl = await generatePanelImage(p, state.characters, state.style);
        return { ...p, imageUrl: imgUrl };
      });
      const newPanels = await Promise.all(promises);
      updateState({ panels: newPanels, isGenerating: false });
    } catch (e) {
      console.error(e);
      alert("이미지 생성 중 오류 발생");
      updateState({ isGenerating: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-10">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI 4-Cut Comic Creator
          </h1>
          <nav className="flex space-x-1 text-sm">
            {[1, 2, 3, 4].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => goToStep(stepNum)}
                disabled={stepNum > state.step && stepNum !== state.step + 1}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  state.step === stepNum
                    ? 'bg-blue-600 text-white font-bold'
                    : stepNum < state.step
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {stepNum}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {state.step === 1 && (
          <Step1Selection 
            data={state} 
            onChange={updateState} 
            onNext={handleGenerateScript} 
          />
        )}
        {state.step === 2 && (
          <Step2Script 
            data={state}
            onUpdatePanel={handleUpdatePanel}
            onUpdateDialogue={handleUpdateDialogue}
            onNext={() => updateState({ step: 3 })}
            onBack={() => updateState({ step: 1 })}
            onRegenerate={handleGenerateScript}
          />
        )}
        {state.step === 3 && (
          <Step3Characters
            data={state}
            onGenerateSingleCharacter={handleGenerateCharacter}
            onGenerateAllCharacters={handleGenerateAllCharacters}
            onNext={() => updateState({ step: 4 })}
            onBack={() => updateState({ step: 2 })}
          />
        )}
        {state.step === 4 && (
          <Step4Comic
            data={state}
            onGenerateSinglePanel={handleGeneratePanel}
            onGenerateAllPanels={handleGenerateAllPanels}
            onBack={() => updateState({ step: 3 })}
          />
        )}
      </main>
    </div>
  );
};

export default App;