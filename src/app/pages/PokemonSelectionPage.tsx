import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Zap, Shield, ChevronRight, Shuffle, Gift, ArrowLeft, Heart } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { fetchPokemonById, calculatePokemonRarity } from '../services/pokeapi';
import { PokedexHeader } from '../components/PokedexHeader';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
  isRented?: boolean;
}

export function PokemonSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || 'normal';

  const [collection, setCollection] = useState<CapturedPokemon[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<(CapturedPokemon | null)[]>([null, null, null]);
  const [showCollection, setShowCollection] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<number | null>(null);
  const [isRenting, setIsRenting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('capturedPokemon');
    if (saved) {
      const captured = JSON.parse(saved);
      setCollection(captured);
      
      // Auto-select first 3 if available
      if (captured.length > 0) {
        const autoSelect = [
          captured[0] || null,
          captured[1] || null,
          captured[2] || null,
        ];
        setSelectedSlots(autoSelect);
      }
    }
  }, []);

  const handleSlotClick = (slotIndex: number) => {
    if (collection.length === 0) {
      // If no collection, show alert to use rental
      alert('No Pokémon in collection! Use "Rent Random Pokémon" to get starter Pokémon.');
      return;
    }
    setSelectingSlot(slotIndex);
    setShowCollection(true);
  };

  const handlePokemonSelect = (pokemon: CapturedPokemon) => {
    if (selectingSlot !== null) {
      const newSlots = [...selectedSlots];
      newSlots[selectingSlot] = pokemon;
      setSelectedSlots(newSlots);
      setShowCollection(false);
      setSelectingSlot(null);
    }
  };

  const handleRandomize = () => {
    if (collection.length === 0) return;
    
    const shuffled = [...collection].sort(() => Math.random() - 0.5);
    const randomSlots = [
      shuffled[0] || null,
      shuffled[1] || null,
      shuffled[2] || null,
    ];
    setSelectedSlots(randomSlots);
  };

  const handleRentPokemon = async () => {
    setIsRenting(true);

    try {
      // Generate 3 random rental Pokemon from all gens (ID 1-898)
      const rentalPokemon: CapturedPokemon[] = [];
      
      for (let i = 0; i < 3; i++) {
        const randomId = Math.floor(Math.random() * 898) + 1; // All gens!
        const data = await fetchPokemonById(randomId);

        const pokemon: CapturedPokemon = {
          ...data,
          rarity: calculatePokemonRarity(data),
          capturedAt: new Date().toISOString(),
          mode: 'rental',
          isRented: true,
        };

        rentalPokemon.push(pokemon);
      }

      console.log('Rental Pokemon generated:', rentalPokemon);

      // Add rental Pokemon to collection (temporary, for this battle only)
      setCollection(prevCollection => [...prevCollection, ...rentalPokemon]);
      
      // Set them to selected slots
      setSelectedSlots(rentalPokemon);
      
      console.log('Selected slots updated with rental Pokemon');
      
      setIsRenting(false);
    } catch (error) {
      console.error('Failed to rent Pokemon:', error);
      alert('Failed to rent Pokemon. Please try again.');
      setIsRenting(false);
    }
  };

  const handleStartBattle = () => {
    // Filter out null values explicitly
    const team: CapturedPokemon[] = [];
    for (const slot of selectedSlots) {
      if (slot !== null) {
        team.push(slot);
      }
    }

    if (team.length === 0) {
      alert('Please select at least one Pokemon!');
      return;
    }

    console.log('=== STARTING BATTLE ===');
    console.log('Team:', team);
    console.log('Team length:', team.length);
    console.log('Mode:', mode);
    console.log('Team details:', team.map(p => ({ name: p.name, id: p.id })));

    // Save to sessionStorage as backup
    sessionStorage.setItem('battleTeam', JSON.stringify(team));
    sessionStorage.setItem('battleMode', mode);

    // Navigate with state
    navigate('/game/battle/encounter', {
      state: { 
        team: team,
        mode: mode 
      }
    });
  };

  const canStart = selectedSlots.some(slot => slot !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 pb-20">
      <PokedexHeader
        leftButton={
          <button
            onClick={() => navigate('/game/battle')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
        }
      />

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl mt-3 font-black text-white mb-2">
            SELECT YOUR POKEMON
          </h1>
          <p className="text-white/80">
            Choose up to 3 Pokémon for battle
          </p>
        </motion.div>

        {/* Pokemon Slots */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {selectedSlots.map((pokemon, index) => (
            <motion.button
              key={index}
              onClick={() => handleSlotClick(index)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative bg-white/10 backdrop-blur-sm border-4 rounded-3xl p-4 min-h-[200px] flex flex-col items-center justify-center transition-all ${
                pokemon 
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' 
                  : 'border-white/30 border-dashed'
              }`}
            >
              {/* Slot Number */}
              <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-black">{index + 1}</span>
              </div>

              {/* Rental Badge */}
              {pokemon?.isRented && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
                  RENTAL
                </div>
              )}

              {pokemon ? (
                <>
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-24 h-24 object-contain mb-2"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <h3 className="text-white font-bold capitalize text-sm mb-1">
                    {pokemon.name}
                  </h3>
                  
                  {/* Rarity Stars */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: pokemon.rarity }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          pokemon.rarity >= 5 ? 'text-yellow-400 fill-yellow-400' :
                          pokemon.rarity >= 3 ? 'text-blue-400 fill-blue-400' :
                          'text-gray-400 fill-gray-400'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Type Badge */}
                  <div className="flex gap-1">
                    {pokemon.types.map(type => (
                      <span
                        key={type}
                        className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white capitalize"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-white/50 text-center">
                  <div className="text-5xl mb-2">+</div>
                  <p className="text-xs">Tap to scan tag</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleRandomize}
            disabled={collection.length === 0}
            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 rounded-2xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            <span>Random Selection</span>
          </button>

          <button
            onClick={handleRentPokemon}
            disabled={isRenting}
            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 rounded-2xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            <span>{isRenting ? 'Loading Rental Pokemon...' : 'Rent Random Pokémon'}</span>
          </button>

          <motion.button
            onClick={handleStartBattle}
            disabled={!canStart}
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            className={`w-full font-black py-6 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 text-xl ${
              canStart
                ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:shadow-yellow-400/50'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <span>START BATTLE</span>
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Collection Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white/80 text-sm">
            Collection: <span className="font-bold text-white">{collection.length}</span> Pokémon
          </p>
          {collection.length === 0 && (
            <div className="mt-3 bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <div className="text-2xl">💡</div>
                <div className="text-left">
                  <h4 className="font-bold text-yellow-300 text-sm mb-1">First Time?</h4>
                  <p className="text-yellow-100 text-xs">
                    Don't have Pokémon yet? Use <strong>"Rent Random Pokémon"</strong> to get 3 starter Pokémon for free! Win battles to catch and build your own collection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collection Modal */}
        <AnimatePresence>
          {showCollection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowCollection(false);
                setSelectingSlot(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-black text-white mb-4 text-center">
                  SELECT POKÉMON FOR SLOT {selectingSlot !== null ? selectingSlot + 1 : ''}
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  {collection.map((pokemon, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handlePokemonSelect(pokemon)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-3 hover:border-yellow-400 transition-all"
                    >
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-16 h-16 object-contain mx-auto mb-2"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <p className="text-white text-xs font-bold capitalize truncate">
                        {pokemon.name}
                      </p>
                      <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: Math.min(pokemon.rarity, 3) }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowCollection(false);
                    setSelectingSlot(null);
                  }}
                  className="w-full mt-4 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}