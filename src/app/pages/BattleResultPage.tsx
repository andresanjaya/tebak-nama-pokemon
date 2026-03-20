import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Zap, RotateCcw, Home } from 'lucide-react';
import { Pokemon } from '../types/pokemon';

export function BattleResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get state data
  const success = location.state?.success as boolean | undefined;
  const pokemon = location.state?.pokemon as Pokemon | undefined;
  const rarity = location.state?.rarity as number | undefined;
  const mode = location.state?.mode as string | undefined;
  const xpEarned = location.state?.xpEarned as number | undefined;

  // Check if state exists, otherwise redirect
  useEffect(() => {
    if (!location.state || !pokemon) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        navigate('/game/battle');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [location.state, pokemon, navigate]);

  // Update player level and XP - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    if (!pokemon || !xpEarned) return;
    
    const currentXP = parseInt(localStorage.getItem('playerXP') || '0');
    const newXP = currentXP + xpEarned;
    localStorage.setItem('playerXP', newXP.toString());

    // Simple leveling system
    const currentLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const xpNeeded = currentLevel * 1000;
    
    if (newXP >= xpNeeded) {
      localStorage.setItem('playerLevel', (currentLevel + 1).toString());
      localStorage.setItem('playerXP', (newXP - xpNeeded).toString());
    }
  }, [pokemon, xpEarned]);

  // Show nothing while redirecting - EARLY RETURN AFTER ALL HOOKS
  if (isRedirecting || !pokemon) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center mb-6"
          >
            <div className="text-8xl mb-4">
              {success ? '🎉' : '😢'}
            </div>
            <h1 className={`text-4xl font-black mb-2 ${
              success ? 'text-green-600' : 'text-gray-600'
            }`}>
              {success ? 'Victory!' : 'Better Luck Next Time'}
            </h1>
          </motion.div>

          {/* Pokemon Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${
              success ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-gray-100'
            } rounded-2xl p-6 mb-6`}
          >
            <img
              src={pokemon.image}
              alt={pokemon.name}
              className="w-32 h-32 object-contain mx-auto mb-4"
              style={{ imageRendering: 'pixelated' }}
            />
            
            <h3 className="text-2xl font-bold text-gray-900 capitalize text-center mb-2">
              {pokemon.name}
            </h3>

            {/* Rarity Stars (if captured) */}
            {success && rarity && (
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: rarity }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`text-3xl ${
                      rarity >= 5 ? 'text-yellow-400' : 
                      rarity >= 3 ? 'text-blue-400' : 
                      'text-gray-400'
                    }`}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
            )}

            {/* Status */}
            <div className="text-center">
              <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                success 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {success ? 'CAPTURED' : 'ESCAPED'}
              </span>
            </div>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-6 mb-6"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Rewards
            </h3>

            <div className="space-y-3">
              {/* XP Reward */}
              <div className="flex items-center justify-between bg-white rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">Experience Points</span>
                </div>
                <span className="font-black text-blue-600 text-lg">
                  +{xpEarned} XP
                </span>
              </div>

              {/* Pokemon Reward (if captured) */}
              {success && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between bg-white rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-semibold text-gray-900">New Pokémon</span>
                  </div>
                  <span className="font-black text-green-600 text-lg capitalize">
                    {pokemon.name}
                  </span>
                </motion.div>
              )}

              {/* Mode Bonus */}
              {mode !== 'normal' && (
                <div className="flex items-center justify-between bg-white rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {mode === 'boss' ? 'Boss Bonus' : 'Event Bonus'}
                    </span>
                  </div>
                  <span className="font-black text-purple-600 text-lg">
                    +{mode === 'boss' ? '100' : '50'} XP
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate('/game/battle')}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Battle Again</span>
            </motion.button>

            {success && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate('/game/battle/collection')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span>View Collection</span>
              </motion.button>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Pokédex</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}