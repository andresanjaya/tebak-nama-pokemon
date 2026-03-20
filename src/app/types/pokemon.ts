export type PokemonType = 
  | 'fire' 
  | 'water' 
  | 'grass' 
  | 'electric' 
  | 'psychic' 
  | 'ice' 
  | 'dragon' 
  | 'dark' 
  | 'fairy' 
  | 'normal' 
  | 'fighting' 
  | 'flying' 
  | 'poison' 
  | 'ground' 
  | 'rock' 
  | 'bug' 
  | 'ghost' 
  | 'steel';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Evolution {
  id: number;
  name: string;
  image: string;
}

export interface Weakness {
  type: PokemonType;
  multiplier: number;
}

export interface Pokemon {
  id: number;
  name: string;
  genus: string;
  types: PokemonType[];
  stats: PokemonStats;
  abilities: string[];
  description: string;
  image: string;
  weight: number; // in kg
  height: number; // in m
  weaknesses: Weakness[];
  isLegendary?: boolean; // Legendary/Mythical Pokemon
  evolution?: {
    prev?: Evolution;
    next?: Evolution;
  };
}

export interface GameQuestion {
  correctPokemon: Pokemon;
  options: Pokemon[];
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: string[];
  incorrectAnswers: string[];
}