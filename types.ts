export enum StyleType {
  CHEERFUL = '명랑만화',
  WEBTOON = '웹툰',
  ILLUSTRATION = '일러스트',
  SKETCH = '스케치',
  CYBERPUNK = '사이버펑크',
  FANTASY = '판타지',
  GHIBLI = '지브리스타일',
  PICASSO = '피카소스타일'
}

export enum GenreType {
  DAILY_COMEDY = '일상 공감 및 개그 만화',
  FANTASY_ADVENTURE = '판타지 모험',
  ROMANCE = '로맨스',
  THRILLER = '스릴러',
  SF = 'SF',
  HISTORY = '역사',
  ACTION = '액션 어드벤처',
  FANTASY_ROMANCE = '판타지 로맨스',
  MYSTERY = '미스터리/범죄',
  HEALING = '힐링/일상물'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Generated reference image
}

export interface Dialogue {
  speaker: string;
  text: string;
}

export interface Panel {
  id: number;
  description: string;
  dialogues: Dialogue[];
  imageUrl?: string;
}

export interface ComicState {
  step: number;
  style: StyleType;
  genre: GenreType;
  storyPrompt: string;
  characters: Character[];
  panels: Panel[];
  isGenerating: boolean;
}