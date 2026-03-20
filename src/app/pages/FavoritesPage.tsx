import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PokemonCard } from '../components/PokemonCard';
import { Pokemon } from '../types/pokemon';
import { fetchPokemonById } from '../services/pokeapi';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const savedIds = localStorage.getItem('favoritePokemon');
        if (savedIds) {
          const ids: number[] = JSON.parse(savedIds);
          const pokemonPromises = ids.map(id => fetchPokemonById(id));
          const pokemonData = await Promise.all(pokemonPromises);
          setFavorites(pokemonData);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      {favorites.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-32 h-32 mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-700 mb-2 text-center">
            No Favorite Pokémon
          </h2>
          <p className="text-gray-500 text-center text-sm max-w-xs">
            Tap the heart icon on any Pokémon card to add them to your favorites!
          </p>
        </div>
      ) : (
        // Favorites List
        <div className="px-4 pt-3 pb-24">
          <p className="text-gray-500 text-sm mb-3">
            {favorites.length} Pokémon saved
          </p>
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {favorites.map((pokemon) => (
                <motion.div
                  key={pokemon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <PokemonCard pokemon={pokemon} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}