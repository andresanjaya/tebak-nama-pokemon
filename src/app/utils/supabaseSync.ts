import { playerProgressService, capturedPokemonService } from '../services/supabaseClient';
import { CapturedPokemonWithProgress, withDefaultProgress } from '../utils/capturedPokemonProgress';
import { fetchPokemonById } from '../services/pokeapi';
import { Pokemon } from '../types/pokemon';

const USER_SCOPED_LOCAL_KEYS = [
  'playerLevel',
  'playerXP',
  'capturedPokemon',
  'capturedCount',
];

export function clearUserScopedLocalData() {
  USER_SCOPED_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * Sync semua player data dari localStorage ke Supabase
 * Jalankan ini setelah login berhasil
 */
export async function syncAllDataToSupabase(userId: string) {
  try {
    // Sync player progress
    const playerLevel = localStorage.getItem('playerLevel');
    const playerXP = localStorage.getItem('playerXP');

    if (playerLevel && playerXP) {
      await playerProgressService.savePlayerProgress(
        userId,
        parseInt(playerLevel),
        parseInt(playerXP)
      );
      console.log('✓ Player progress synced');
    }

    // Sync captured pokemon
    const capturedPokemonStr = localStorage.getItem('capturedPokemon');
    if (capturedPokemonStr) {
      try {
        const capturedPokemon: CapturedPokemonWithProgress[] = JSON.parse(capturedPokemonStr);
        for (const pokemon of capturedPokemon) {
          await capturedPokemonService.saveCapturedPokemon(userId, pokemon);
        }
        console.log(`✓ ${capturedPokemon.length} pokemon synced`);
      } catch (e) {
        console.error('Failed to parse captured pokemon:', e);
      }
    }

    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

/**
 * Load semua player data dari Supabase ke localStorage
 * Jalankan ini pada app startup setelah login check
 */
export async function syncAllDataFromSupabase(userId: string) {
  try {
    // Always clear current user-scoped cache before loading next account data.
    // This prevents cross-account leakage when switching users in the same browser.
    clearUserScopedLocalData();

    // Load player progress
    const playerProgress = await playerProgressService.getPlayerProgress(userId);
    if (playerProgress) {
      localStorage.setItem('playerLevel', playerProgress.level.toString());
      localStorage.setItem('playerXP', playerProgress.xp.toString());
      console.log('✓ Player progress loaded');
    } else {
      localStorage.setItem('playerLevel', '1');
      localStorage.setItem('playerXP', '0');
    }

    // Load captured pokemon
    const capturedRows = await capturedPokemonService.getCapturedPokemon(userId);

    const hydratedCapturedPokemon = await Promise.all(
      (capturedRows || []).map(async (row: any) => {
        let basePokemon: Pokemon;

        try {
          basePokemon = await fetchPokemonById(row.pokemon_id);
        } catch {
          // Fallback shape keeps collection usable even if PokeAPI fails temporarily.
          basePokemon = {
            id: row.pokemon_id,
            name: `Pokemon #${row.pokemon_id}`,
            genus: 'Unknown Pokemon',
            types: ['normal'],
            stats: {
              hp: 50,
              attack: 50,
              defense: 50,
              specialAttack: 50,
              specialDefense: 50,
              speed: 50,
            },
            abilities: [],
            description: 'Pokemon data is temporarily unavailable.',
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${row.pokemon_id}.png`,
            weight: 0,
            height: 0,
            weaknesses: [],
          };
        }

        return withDefaultProgress({
          ...basePokemon,
          capturedId: row.captured_id,
          capturedAt: row.created_at || new Date().toISOString(),
          level: row.level,
          xp: row.xp,
          wins: row.wins,
          battlesUsed: row.battles_used,
        } as CapturedPokemonWithProgress);
      })
    );

    localStorage.setItem('capturedPokemon', JSON.stringify(hydratedCapturedPokemon));
    localStorage.setItem('capturedCount', hydratedCapturedPokemon.length.toString());
    console.log(`✓ ${hydratedCapturedPokemon.length} pokemon loaded`);

    return true;
  } catch (error) {
    console.error('Load failed:', error);
    throw error;
  }
}

/**
 * Sync captured pokemon baru/update ke Supabase
 * Jalankan otomatis setelah catch pokemon atau battle
 */
export async function syncCapturedPokemonToSupabase(
  userId: string,
  pokemon: CapturedPokemonWithProgress
) {
  try {
    await capturedPokemonService.saveCapturedPokemon(userId, pokemon);
    console.log(`✓ Pokemon ${pokemon.name} synced`);
  } catch (error) {
    console.error('Pokemon sync failed:', error);
    // Fallback: tetap simpan di localStorage
    const capturedPokemonStr = localStorage.getItem('capturedPokemon');
    const capturedPokemon: CapturedPokemonWithProgress[] = capturedPokemonStr
      ? JSON.parse(capturedPokemonStr)
      : [];
    const index = capturedPokemon.findIndex(
      (p) => (p.capturedId && pokemon.capturedId && p.capturedId === pokemon.capturedId) || p.id === pokemon.id
    );
    if (index >= 0) {
      capturedPokemon[index] = pokemon;
    } else {
      capturedPokemon.push(pokemon);
    }
    localStorage.setItem('capturedPokemon', JSON.stringify(capturedPokemon));
  }
}

/**
 * Sync player progress baru/update ke Supabase
 * Jalankan otomatis setelah battle/capture/guess
 */
export async function syncPlayerProgressToSupabase(
  userId: string,
  level: number,
  xp: number
) {
  try {
    await playerProgressService.savePlayerProgress(userId, level, xp);
    console.log(`✓ Player progress synced (Lv ${level}, XP ${xp})`);
  } catch (error) {
    console.error('Progress sync failed:', error);
    // Fallback: tetap simpan di localStorage
    localStorage.setItem('playerLevel', level.toString());
    localStorage.setItem('playerXP', xp.toString());
  }
}
