import { PokemonType } from '../types/pokemon';

// Exact Pokemon type colors from official design system
export const typeColors: Record<PokemonType, string> = {
  water: '#6890F0',
  fire: '#F08030',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
};

// Light versions for backgrounds
export const typeLightColors: Record<PokemonType, string> = {
  water: '#E0F0FF',
  fire: '#FFE5D0',
  grass: '#E0FFD0',
  electric: '#FFFBD0',
  psychic: '#FFE0F0',
  ice: '#E0FFFF',
  dragon: '#E8D8FF',
  dark: '#E8E0D8',
  fairy: '#FFE8F0',
  normal: '#F0F0E0',
  fighting: '#FFE0D8',
  flying: '#E8E0FF',
  poison: '#F0D8F0',
  ground: '#FFF0D8',
  rock: '#F0E8D0',
  bug: '#F0FFD0',
  ghost: '#E8E0F0',
  steel: '#F0F0FF',
};
