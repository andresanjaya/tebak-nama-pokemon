import { PokemonType } from '../types/pokemon';
import { getTypeIconStyle } from '../utils/typeIconImages';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
}

// Exact colors from Pokemon design system
const typeColors: Record<PokemonType, string> = {
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

export function TypeBadge({ type, size = 'md', showIcon = true }: TypeBadgeProps) {
  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'sm'
      ? 'text-xs px-2.5 py-1'
      : 'text-sm px-3 py-1.5';
  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 14 : 16;
  
  return (
    <span
      style={{ backgroundColor: typeColors[type] }}
      className={`${sizeClasses} rounded-full text-white capitalize inline-flex items-center gap-1 font-medium shadow-sm`}
    >
      {showIcon && (
        <div 
          style={getTypeIconStyle(type, iconSize)}
          className="flex-shrink-0"
        />
      )}
      {type}
    </span>
  );
}