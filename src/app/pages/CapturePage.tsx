import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { calculatePokemonRarity } from '../services/pokeapi';

export function CapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [mode, setMode] = useState<string>('normal');
  
  const [capturing, setCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState<boolean | null>(null);
  const [meterValue, setMeterValue] = useState(0);
  const [meterDirection, setMeterDirection] = useState<'up' | 'down'>('up');
  const [captureAttempted, setCaptureAttempted] = useState(false);
  const [rarity, setRarity] = useState(1);

  // Calculate capture probability based on mode
  const baseProbability = mode === 'normal' ? 0.7 : mode === 'boss' ? 0.3 : 0.5;
  const successZoneStart = 40;
  const successZoneEnd = 60;

  // Initialize state from location or sessionStorage
  useEffect(() => {
    let pokemonData = location.state?.pokemon as Pokemon | undefined;
    let modeData = location.state?.mode as string | undefined;

    // Fallback to sessionStorage
    if (!pokemonData) {
      const savedEnemy = sessionStorage.getItem('battleEnemy');
      const savedMode = sessionStorage.getItem('battleMode');
      
      if (savedEnemy) {
        pokemonData = JSON.parse(savedEnemy);
        modeData = savedMode || 'normal';
        console.log('CapturePage - Retrieved from sessionStorage');
      }
    }

    console.log('=== CapturePage mounted ===');
    console.log('Pokemon:', pokemonData?.name);
    console.log('Mode:', modeData);

    if (!pokemonData) {
      console.error('❌ No Pokemon in CapturePage');
      console.error('Redirecting back...');
      
      setTimeout(() => {
        navigate('/game/battle', { replace: true });
      }, 100);
      return;
    }

    setPokemon(pokemonData);
    setMode(modeData || 'normal');
  }, [location, navigate]);

  // Meter animation
  useEffect(() => {
    if (capturing && !captureAttempted && pokemon) {
      const interval = setInterval(() => {
        setMeterValue(prev => {
          if (meterDirection === 'up') {
            if (prev >= 100) {
              setMeterDirection('down');
              return 100;
            }
            return prev + 2;
          } else {
            if (prev <= 0) {
              setMeterDirection('up');
              return 0;
            }
            return prev - 2;
          }
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [capturing, captureAttempted, meterDirection, pokemon]);

  // Calculate rarity (1-6 stars) based on Pokemon total stats
  useEffect(() => {
    if (!pokemon) return;
    setRarity(calculatePokemonRarity(pokemon));
  }, [pokemon]);

  // Return early AFTER all hooks
  if (!pokemon) {
    return null;
  }

  const startCapture = () => {
    setCapturing(true);
  };

  const attemptCapture = () => {
    if (captureAttempted) return;
    
    setCaptureAttempted(true);
    
    // Check if meter is in success zone
    const inSuccessZone = meterValue >= successZoneStart && meterValue <= successZoneEnd;
    
    // Calculate final success rate
    const bonusFromTiming = inSuccessZone ? 0.2 : 0;
    const finalProbability = Math.min(0.95, baseProbability + bonusFromTiming);
    
    const success = Math.random() < finalProbability;
    
    setTimeout(() => {
      setCaptureSuccess(success);
      
      if (success) {
        // Save captured Pokemon
        const capturedPokemon = {
          ...pokemon,
          rarity,
          capturedAt: new Date().toISOString(),
          mode,
        };
        
        const saved = localStorage.getItem('capturedPokemon');
        const captured = saved ? JSON.parse(saved) : [];
        captured.push(capturedPokemon);
        localStorage.setItem('capturedPokemon', JSON.stringify(captured));
        
        // Update capture count
        localStorage.setItem('capturedCount', captured.length.toString());
      }
    }, 1500);
  };

  const handleContinue = () => {
    if (captureSuccess) {
      navigate('/game/battle/result', {
        state: {
          success: true,
          pokemon,
          rarity,
          mode,
          xpEarned: mode === 'boss' ? 250 : mode === 'event' ? 200 : 75,
        }
      });
    } else {
      navigate('/game/battle/result', {
        state: {
          success: false,
          pokemon,
          mode,
          xpEarned: 25,
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Capture Animation */}
        <AnimatePresence mode="wait">
          {!captureSuccess && captureSuccess !== false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              {/* Pokemon */}
              <motion.div
                animate={{ 
                  scale: capturing ? [1, 1.1, 1] : 1,
                  rotate: capturing ? [0, -5, 5, 0] : 0,
                }}
                transition={{ 
                  repeat: capturing ? Infinity : 0,
                  duration: 2,
                }}
                className="mb-8"
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-48 h-48 object-contain mx-auto drop-shadow-2xl"
                  style={{ imageRendering: 'pixelated' }}
                />
              </motion.div>

              {/* Pokemon Info */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
                <h2 className="text-3xl font-black text-gray-900 capitalize mb-2">
                  {pokemon.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  A wild Pokémon appeared!
                </p>

                {/* Probability Indicator */}
                <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">
                      Capture Rate
                    </span>
                    <span className="text-lg font-black text-green-600">
                      {Math.round(baseProbability * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${baseProbability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Capture Meter */}
                {capturing && !captureAttempted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        Timing Meter
                      </span>
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    
                    {/* Meter Container */}
                    <div className="relative h-12 bg-gray-300 rounded-2xl overflow-hidden">
                      {/* Success Zone */}
                      <div 
                        className="absolute h-full bg-green-400/50"
                        style={{ 
                          left: `${successZoneStart}%`,
                          width: `${successZoneEnd - successZoneStart}%`,
                        }}
                      />
                      
                      {/* Moving Indicator */}
                      <motion.div
                        className="absolute top-0 bottom-0 w-2 bg-purple-600"
                        style={{ left: `${meterValue}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2">
                      Tap when the line is in the green zone for bonus chance!
                    </p>
                  </motion.div>
                )}

                {/* Capture Button */}
                {!capturing && (
                  <button
                    onClick={startCapture}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5" />
                      <span>Start Capture</span>
                    </div>
                  </button>
                )}

                {/* Attempt Button */}
                {capturing && !captureAttempted && (
                  <button
                    onClick={attemptCapture}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all animate-pulse"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span>THROW POKÉBALL!</span>
                    </div>
                  </button>
                )}

                {/* Capturing Animation */}
                {captureAttempted && captureSuccess === null && (
                  <div className="text-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-3"
                    >
                      🔴
                    </motion.div>
                    <p className="text-gray-700 font-bold">Capturing...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Success Result */}
          {captureSuccess === true && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.6 }}
                className="text-9xl mb-6"
              >
                ✨
              </motion.div>

              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h2 className="text-4xl font-black text-green-600 mb-4">
                  Captured!
                </h2>
                
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain mx-auto mb-4"
                  style={{ imageRendering: 'pixelated' }}
                />

                <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                  {pokemon.name}
                </h3>

                {/* Rarity Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: rarity }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`text-2xl ${
                        rarity >= 5 ? 'text-yellow-400' : 
                        rarity >= 3 ? 'text-blue-400' : 
                        'text-gray-400'
                      }`}
                    >
                      ★
                    </motion.span>
                  ))}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Failure Result */}
          {captureSuccess === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{ duration: 0.5 }}
                className="text-9xl mb-6"
              >
                💔
              </motion.div>

              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h2 className="text-4xl font-black text-red-600 mb-4">
                  Escaped!
                </h2>
                
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-32 h-32 object-contain mx-auto mb-4 opacity-50"
                  style={{ imageRendering: 'pixelated' }}
                />

                <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                  {pokemon.name}
                </h3>

                <p className="text-gray-600 mb-6">
                  The Pokémon broke free and escaped!
                </p>

                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}