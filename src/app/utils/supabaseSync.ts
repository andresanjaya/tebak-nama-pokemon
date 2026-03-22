import { playerProgressService, capturedPokemonService } from '../services/supabaseClient';
import { CapturedPokemonProgress } from '../utils/capturedPokemonProgress';

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
        const capturedPokemon: CapturedPokemonProgress[] = JSON.parse(capturedPokemonStr);
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
    // Load player progress
    const playerProgress = await playerProgressService.getPlayerProgress(userId);
    if (playerProgress) {
      localStorage.setItem('playerLevel', playerProgress.level.toString());
      localStorage.setItem('playerXP', playerProgress.xp.toString());
      console.log('✓ Player progress loaded');
    }

    // Load captured pokemon
    const capturedPokemon = await capturedPokemonService.getCapturedPokemon(userId);
    if (capturedPokemon && capturedPokemon.length > 0) {
      localStorage.setItem('capturedPokemon', JSON.stringify(capturedPokemon));
      console.log(`✓ ${capturedPokemon.length} pokemon loaded`);
    }

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
  pokemon: CapturedPokemonProgress
) {
  try {
    await capturedPokemonService.saveCapturedPokemon(userId, pokemon);
    console.log(`✓ Pokemon ${pokemon.name} synced`);
  } catch (error) {
    console.error('Pokemon sync failed:', error);
    // Fallback: tetap simpan di localStorage
    const capturedPokemonStr = localStorage.getItem('capturedPokemon');
    const capturedPokemon: CapturedPokemonProgress[] = capturedPokemonStr
      ? JSON.parse(capturedPokemonStr)
      : [];
    const index = capturedPokemon.findIndex((p) => p.id === pokemon.id);
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
