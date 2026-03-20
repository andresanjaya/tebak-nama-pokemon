import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Trophy, Filter, Search } from 'lucide-react';
import { PokedexHeader } from '../components/PokedexHeader';
import { Pokemon } from '../types/pokemon';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

export function CollectionPage() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CapturedPokemon[]>([]);
  const [filteredCollection, setFilteredCollection] = useState<CapturedPokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'normal' | 'boss' | 'event'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity' | 'name'>('recent');

  useEffect(() => {
    // Load captured Pokemon from localStorage
    const saved = localStorage.getItem('capturedPokemon');
    if (saved) {
      const captured = JSON.parse(saved) as CapturedPokemon[];
      setCollection(captured);
      setFilteredCollection(captured);
    }
  }, []);

  useEffect(() => {
    let filtered = [...collection];

    // Filter by mode
    if (filterMode !== 'all') {
      filtered = filtered.filter(p => p.mode === filterMode);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
    } else if (sortBy === 'rarity') {
      filtered.sort((a, b) => b.rarity - a.rarity);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredCollection(filtered);
  }, [collection, filterMode, searchQuery, sortBy]);

  const rarityColor = (rarity: number) => {
    if (rarity >= 5) return 'text-yellow-400';
    if (rarity >= 3) return 'text-blue-400';
    return 'text-gray-400';
  };

  const modeColor = (mode: string) => {
    if (mode === 'boss') return 'bg-red-500';
    if (mode === 'event') return 'bg-purple-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PokedexHeader
        leftButton={
          <button
            onClick={() => navigate('/game/battle')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
        }
        title="My Collection"
      />

      <div className="p-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="text-3xl font-black text-gray-900">{collection.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="text-3xl font-black text-yellow-500">
              {collection.filter(p => p.rarity >= 5).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Legendary</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg text-center"
          >
            <div className="text-3xl font-black text-red-500">
              {collection.filter(p => p.mode === 'boss').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Boss</div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
          {['all', 'normal', 'boss', 'event'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode as any)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                filterMode === mode
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Sort:</span>
          </div>
          {[
            { id: 'recent', label: 'Recent' },
            { id: 'rarity', label: 'Rarity' },
            { id: 'name', label: 'Name' },
          ].map((sort) => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as any)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                sortBy === sort.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        {filteredCollection.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {collection.length === 0 ? 'No Pokémon Yet' : 'No Results'}
            </h3>
            <p className="text-gray-600 mb-6">
              {collection.length === 0 
                ? 'Start battling to capture your first Pokémon!' 
                : 'Try adjusting your filters'}
            </p>
            {collection.length === 0 && (
              <button
                onClick={() => navigate('/game/battle')}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-6 py-3 rounded-2xl"
              >
                Start Battle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCollection.map((pokemon, index) => (
                <motion.div
                  key={`${pokemon.id}-${pokemon.capturedAt}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                  className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Mode Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <div className={`${modeColor(pokemon.mode)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {pokemon.mode.toUpperCase()}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: pokemon.rarity }).map((_, i) => (
                        <span key={i} className={`text-sm ${rarityColor(pokemon.rarity)}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pokemon Image */}
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-full h-32 object-contain mb-3"
                    style={{ imageRendering: 'pixelated' }}
                  />

                  {/* Pokemon Info */}
                  <h3 className="text-lg font-bold text-gray-900 capitalize mb-1 truncate">
                    {pokemon.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Trophy className="w-3 h-3" />
                    <span>
                      {new Date(pokemon.capturedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
