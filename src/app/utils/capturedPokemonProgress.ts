import { Pokemon } from '../types/pokemon';
import { applyXpGain } from './playerProgress';
import { getXpRequiredForNextLevel } from './playerProgress';
import { getPokemonBattleXp } from './expRewards';

export interface CapturedPokemonProgressFields {
  capturedId?: string;
  level?: number;
  xp?: number;
  battlesUsed?: number;
  wins?: number;
  capturedAt?: string;
  mode?: string;
  isRented?: boolean;
}

export type CapturedPokemonWithProgress = Pokemon & CapturedPokemonProgressFields;

export interface PokemonXpProgress {
  level: number;
  currentXp: number;
  xpRequired: number;
  progressPercent: number;
}

export interface PokemonLevelUpEvent {
  capturedId: string;
  name: string;
  fromLevel: number;
  toLevel: number;
}

interface ApplyBattleProgressResult {
  levelUps: PokemonLevelUpEvent[];
  updatedCount: number;
  xpGainPerPokemon: number;
}

const FALLBACK_LEVEL_MIN = 1;

export const getPokemonLevel = (pokemon: CapturedPokemonProgressFields & { stats?: { hp?: number } }): number => {
  if (typeof pokemon.level === 'number' && Number.isFinite(pokemon.level)) {
    return Math.max(FALLBACK_LEVEL_MIN, Math.floor(pokemon.level));
  }

  return Math.max(FALLBACK_LEVEL_MIN, Math.floor((pokemon.stats?.hp ?? 10) / 10));
};

export const getPokemonXp = (pokemon: CapturedPokemonProgressFields): number => {
  if (typeof pokemon.xp === 'number' && Number.isFinite(pokemon.xp)) {
    return Math.max(0, Math.floor(pokemon.xp));
  }

  return 0;
};

export const getPokemonXpProgress = (
  pokemon: CapturedPokemonProgressFields & { stats?: { hp?: number } }
): PokemonXpProgress => {
  const level = getPokemonLevel(pokemon);
  const currentXp = getPokemonXp(pokemon);
  const xpRequired = getXpRequiredForNextLevel(level);
  const progressPercent = xpRequired > 0 ? Math.min(100, Math.max(0, (currentXp / xpRequired) * 100)) : 0;

  return {
    level,
    currentXp,
    xpRequired,
    progressPercent,
  };
};

export const createCapturedPokemonId = (): string => {
  return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const readCapturedPokemonFromStorage = <T extends object = CapturedPokemonWithProgress>(): T[] => {
  const saved = localStorage.getItem('capturedPokemon');

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const withDefaultProgress = <T extends CapturedPokemonWithProgress>(pokemon: T): T => {
  return {
    ...pokemon,
    capturedId: pokemon.capturedId || createCapturedPokemonId(),
    level: getPokemonLevel(pokemon),
    xp: getPokemonXp(pokemon),
    battlesUsed: Math.max(0, Math.floor(pokemon.battlesUsed ?? 0)),
    wins: Math.max(0, Math.floor(pokemon.wins ?? 0)),
  };
};

const getBattlePokemonXpGain = (battleMode: string, didWin: boolean): number => {
  return getPokemonBattleXp(battleMode, didWin);
};

const isSameCapturedPokemon = (
  entry: CapturedPokemonWithProgress,
  target: CapturedPokemonWithProgress
): boolean => {
  if (entry.capturedId && target.capturedId) {
    return entry.capturedId === target.capturedId;
  }

  if (entry.capturedAt && target.capturedAt) {
    return entry.id === target.id && entry.capturedAt === target.capturedAt;
  }

  return entry.id === target.id;
};

export const applyBattleProgressToCapturedPokemon = (
  team: CapturedPokemonWithProgress[],
  didWin: boolean,
  battleMode: string
): ApplyBattleProgressResult => {
  const stored = readCapturedPokemonFromStorage<CapturedPokemonWithProgress>();
  if (stored.length === 0) {
    return {
      levelUps: [],
      updatedCount: 0,
      xpGainPerPokemon: 0,
    };
  }

  const captured = stored.map(withDefaultProgress);
  const xpGain = getBattlePokemonXpGain(battleMode, didWin);

  const updated = [...captured];
  const levelUps: PokemonLevelUpEvent[] = [];
  let updatedCount = 0;

  team.forEach((teamPokemon) => {
    if (teamPokemon.isRented) {
      return;
    }

    const normalizedTeamPokemon = withDefaultProgress(teamPokemon);
    const index = updated.findIndex((entry) => isSameCapturedPokemon(entry, normalizedTeamPokemon));

    if (index < 0) {
      return;
    }

    const current = withDefaultProgress(updated[index]);
    const progression = applyXpGain(current.level ?? 1, current.xp ?? 0, xpGain);

    if (progression.newLevel > (current.level ?? 1)) {
      levelUps.push({
        capturedId: current.capturedId || normalizedTeamPokemon.capturedId || createCapturedPokemonId(),
        name: current.name,
        fromLevel: current.level ?? 1,
        toLevel: progression.newLevel,
      });
    }

    updated[index] = {
      ...current,
      level: progression.newLevel,
      xp: progression.newXp,
      battlesUsed: (current.battlesUsed ?? 0) + 1,
      wins: (current.wins ?? 0) + (didWin ? 1 : 0),
    };
    updatedCount += 1;
  });

  localStorage.setItem('capturedPokemon', JSON.stringify(updated));

  return {
    levelUps,
    updatedCount,
    xpGainPerPokemon: xpGain,
  };
}
