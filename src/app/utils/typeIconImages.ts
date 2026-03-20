import { PokemonType } from '../types/pokemon';

// Import the type icons sprite sheet from local assets
import typeIconsSprite from '../../assets/7d5ded172cb118882c7b60e399f1dd3a1ec2f106.png';

// This is a sprite sheet with all type icons
export const typeIconSprite = typeIconsSprite;

// Positions for each type icon in the sprite (6 columns, 3 rows)
// Base icon size in sprite: 128px
export const typeIconPositions: Record<PokemonType, { col: number; row: number }> = {
  normal: { col: 0, row: 0 },
  fighting: { col: 1, row: 0 },
  flying: { col: 2, row: 0 },
  poison: { col: 3, row: 0 },
  ground: { col: 4, row: 0 },
  rock: { col: 5, row: 0 },
  
  bug: { col: 0, row: 1 },
  ghost: { col: 1, row: 1 },
  steel: { col: 2, row: 1 },
  fire: { col: 3, row: 1 },
  water: { col: 4, row: 1 },
  grass: { col: 5, row: 1 },
  
  electric: { col: 0, row: 2 },
  psychic: { col: 1, row: 2 },
  ice: { col: 2, row: 2 },
  dragon: { col: 3, row: 2 },
  dark: { col: 4, row: 2 },
  fairy: { col: 5, row: 2 },
};

const SPRITE_COLS = 6;
const SPRITE_ROWS = 3;
const BASE_ICON_SIZE = 128; // Size of each icon in the sprite

export function getTypeIconStyle(type: PokemonType, displaySize: number = 18) {
  const pos = typeIconPositions[type];
  const scale = displaySize / BASE_ICON_SIZE;
  
  return {
    backgroundImage: `url(${typeIconSprite})`,
    backgroundPosition: `-${pos.col * displaySize}px -${pos.row * displaySize}px`,
    backgroundSize: `${SPRITE_COLS * displaySize}px ${SPRITE_ROWS * displaySize}px`,
    width: `${displaySize}px`,
    height: `${displaySize}px`,
    backgroundRepeat: 'no-repeat',
  };
}