import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Swords } from 'lucide-react';
import { Pokemon } from '../types/pokemon';nimport { fetchRandomLegendaryPokemon } from '../services/pokeapi';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

export function EnemyEncounterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [team, setTeam] = useState<CapturedPokemon[] | null>(null);
  const [mode, setMode] = useState<string>('normal');
  const [enemy, setEnemy] = useState<Pokemon | null>(null);
  const [showVS, setShowVS] = useState(false);

  useEffect(() => {
    // Try to get state from location
    let teamData = location.state?.team as CapturedPokemon[] | undefined;
    let modeData = location.state?.mode as string | undefined;

    // Fallback to sessionStorage if location state is missing
    if (!teamData || teamData.length === 0) {
      console.log('Location state missing, checking sessionStorage...');
      const savedTeam = sessionStorage.getItem('battleTeam');
      const savedMode = sessionStorage.getItem('battleMode');
      
      if (savedTeam) {
        teamData = JSON.parse(savedTeam);
        modeData = savedMode || 'normal';
        console.log('Retrieved from sessionStorage:', { teamData, modeData });
      }
    }

    console.log('=== EnemyEncounterPage mounted ===');
    console.log('Location:', location.pathname);
    console.log('Location state:', location.state);
    console.log('Team from state:', teamData);
    console.log('Team length:', teamData?.length);
    console.log('Mode:', modeData);
    
    // Check if we have the required state
    if (!teamData || teamData.length === 0) {
      console.error('âŒ No team provided to EnemyEncounterPage');
      console.error('Location state:', location.state);
      console.error('SessionStorage battleTeam:', sessionStorage.getItem('battleTeam'));
      console.error('Redirecting back to battle select...');
      
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        navigate('/game/battle', { replace: true });
      }, 100);
      return;
    }

    // Set state
    setTeam(teamData);
    setMode(modeData || 'normal');

    console.log('âœ… Team validated, fetching enemy...');

    // Fetch random enemy Pokemon
    const fetchEnemy = async () => {
      try {
        const randomId = Math.floor(Math.random() * 898) + 1; // All gens!
        console.log('Fetching enemy Pokemon with ID:', randomId);
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        const data = await response.json();

        const enemyPokemon: Pokemon = {
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map((t: any) => t.type.name),
          stats: {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            speed: data.stats[5].base_stat,
          },
        };

        console.log('âœ… Enemy Pokemon fetched:', enemyPokemon.name);
        setEnemy(enemyPokemon);
        
        // Show VS after delay
        setTimeout(() => {
          console.log('Showing VS screen');
          setShowVS(true);
        }, 1500);
        
        // Auto proceed to first attack chance
        setTimeout(() => {
          console.log('Navigating to first-attack with team:', teamData!.length, 'Pokemon');
          
          // Save to sessionStorage before navigating
          sessionStorage.setItem('battleTeam', JSON.stringify(teamData));
          sessionStorage.setItem('battleEnemy', JSON.stringify(enemyPokemon));
          sessionStorage.setItem('battleMode', modeData || 'normal');
          
          navigate('/game/battle/first-attack', {
            state: { team: teamData, enemy: enemyPokemon, mode: modeData }
          });
        }, 3500);
      } catch (error) {
        console.error('Failed to fetch enemy:', error);
        navigate('/game/battle');
      }
    };

    fetchEnemy();
  }, [location, navigate]);

  if (!team || !enemy) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const playerPokemon = team[0]; // Main Pokemon

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black flex items-center justify-center p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Wild Pokemon Appeared Text */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-5xl font-black text-white mb-2"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
          >
            WILD POKÃ‰MON
          </motion.h1>
          <motion.h2
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="text-6xl font-black text-yellow-400"
            style={{ textShadow: '0 0 30px rgba(250,204,21,0.8)' }}
          >
            APPEARED!
          </motion.h2>
        </motion.div>

        {/* Battle Preview */}
        <div className="relative flex items-center justify-between">
          {/* Player Pokemon */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="flex-1"
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 shadow-2xl border-4 border-white/30">
              <div className="text-center mb-3">
                <p className="text-white/80 text-sm font-bold mb-1">YOUR POKÃ‰MON</p>
                <h3 className="text-2xl font-black text-white capitalize">
                  {playerPokemon?.name}
                </h3>
              </div>
              
              {playerPokemon && (
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  src={playerPokemon.image}
                  alt={playerPokemon.name}
                  className="w-32 h-32 object-contain mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}

              {/* Power Indicator */}
              <div className="mt-3 bg-white/20 rounded-xl p-2">
                <p className="text-white text-xs text-center">
                  Power: {playerPokemon?.stats.attack || 0}
                </p>
              </div>
            </div>
          </motion.div>

          {/* VS Badge */}
          {showVS && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-red-500 to-orange-500 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                  <Swords className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Enemy Pokemon */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="flex-1"
          >
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl p-6 shadow-2xl border-4 border-white/30">
              <div className="text-center mb-3">
                <p className="text-white/80 text-sm font-bold mb-1">ENEMY POKÃ‰MON</p>
                <h3 className="text-2xl font-black text-white capitalize">
                  {enemy?.name || '???'}
                </h3>
              </div>
              
              {enemy ? (
                <motion.img
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  src={enemy.image}
                  alt={enemy.name}
                  className="w-32 h-32 object-contain mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-32 h-32 mx-auto bg-white/20 rounded-full animate-pulse" />
              )}

              {/* Power Indicator */}
              <div className="mt-3 bg-white/20 rounded-xl p-2">
                <p className="text-white text-xs text-center">
                  Power: {enemy?.stats.attack || '???'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-white">
            <Zap className="w-5 h-5 animate-pulse text-yellow-400" />
            <span className="font-bold">Preparing for battle...</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}