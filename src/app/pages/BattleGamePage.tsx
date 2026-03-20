import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Heart, Zap, Shield, Swords, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchRandomPokemon } from '../services/pokeapi';
import { Pokemon } from '../types/pokemon';
import { PokedexHeader } from '../components/PokedexHeader';

type BattleAction = 'attack' | 'skill' | 'defend';
type BattlePhase = 'player-turn' | 'enemy-turn' | 'player-won' | 'player-lost';

export function BattleGamePage() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);
  const [enemyPokemon, setEnemyPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [playerMaxHP] = useState(100);
  const [enemyMaxHP] = useState(100);
  
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('player-turn');
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isDefending, setIsDefending] = useState(false);
  const [showDamage, setShowDamage] = useState<{ target: 'player' | 'enemy'; amount: number } | null>(null);

  // Load Pokemon
  useEffect(() => {
    const loadBattle = async () => {
      try {
        setLoading(true);
        const pokemon = await fetchRandomPokemon(2);
        setPlayerPokemon(pokemon[0]);
        setEnemyPokemon(pokemon[1]);
      } catch (error) {
        console.error('Failed to load battle:', error);
        navigate('/game/battle');
      } finally {
        setLoading(false);
      }
    };

    loadBattle();
  }, [navigate]);

  // Enemy turn logic
  useEffect(() => {
    if (battlePhase === 'enemy-turn' && enemyHP > 0) {
      const timer = setTimeout(() => {
        enemyAttack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battlePhase]);

  const addLog = (message: string) => {
    setActionLog(prev => [message, ...prev].slice(0, 5));
  };

  const enemyAttack = () => {
    const damage = Math.floor(Math.random() * 20) + 10;
    const actualDamage = isDefending ? Math.floor(damage * 0.5) : damage;
    
    setShowDamage({ target: 'player', amount: actualDamage });
    setTimeout(() => setShowDamage(null), 1000);
    
    setPlayerHP(prev => {
      const newHP = Math.max(0, prev - actualDamage);
      if (newHP <= 0) {
        setBattlePhase('player-lost');
        addLog(`You were defeated!`);
      } else {
        setBattlePhase('player-turn');
      }
      return newHP;
    });
    
    addLog(`${enemyPokemon?.name} attacked! -${actualDamage} HP`);
    setIsDefending(false);
  };

  const handleAction = (action: BattleAction) => {
    if (battlePhase !== 'player-turn') return;

    if (action === 'attack') {
      const damage = Math.floor(Math.random() * 25) + 15;
      
      setShowDamage({ target: 'enemy', amount: damage });
      setTimeout(() => setShowDamage(null), 1000);
      
      setEnemyHP(prev => {
        const newHP = Math.max(0, prev - damage);
        if (newHP <= 0) {
          setBattlePhase('player-won');
          addLog(`Victory! ${enemyPokemon?.name} fainted!`);
        } else {
          setBattlePhase('enemy-turn');
        }
        return newHP;
      });
      
      addLog(`${playerPokemon?.name} attacked! -${damage} HP`);
      
    } else if (action === 'skill') {
      const damage = Math.floor(Math.random() * 40) + 25;
      
      setShowDamage({ target: 'enemy', amount: damage });
      setTimeout(() => setShowDamage(null), 1000);
      
      setEnemyHP(prev => {
        const newHP = Math.max(0, prev - damage);
        if (newHP <= 0) {
          setBattlePhase('player-won');
          addLog(`Victory! ${enemyPokemon?.name} fainted!`);
        } else {
          setBattlePhase('enemy-turn');
        }
        return newHP;
      });
      
      addLog(`${playerPokemon?.name} used Special Attack! -${damage} HP`);
      
    } else if (action === 'defend') {
      setIsDefending(true);
      addLog(`${playerPokemon?.name} is defending!`);
      setBattlePhase('enemy-turn');
    }
  };

  const handleBattleEnd = () => {
    if (battlePhase === 'player-won') {
      navigate('/game/battle/capture', {
        state: { pokemon: enemyPokemon, mode }
      });
    } else {
      navigate('/game/battle');
    }
  };

  if (loading || !playerPokemon || !enemyPokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading battle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400">
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
        title="Battle"
      />

      {/* Battle Arena */}
      <div className="p-4 pb-20">
        {/* Enemy Pokemon */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900 capitalize text-lg">
                  {enemyPokemon.name}
                </h3>
                <p className="text-xs text-gray-600">Wild Pokémon</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">
                  HP: {enemyHP} / {enemyMaxHP}
                </div>
              </div>
            </div>
            {/* HP Bar */}
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-all ${
                  enemyHP > 50 ? 'bg-green-500' : enemyHP > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${(enemyHP / enemyMaxHP) * 100}%` }}
              />
            </div>
          </div>

          {/* Enemy Pokemon Image */}
          <div className="relative flex justify-end">
            <motion.div
              animate={battlePhase === 'enemy-turn' ? { x: [-10, 0] } : {}}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img
                src={enemyPokemon.image}
                alt={enemyPokemon.name}
                className="w-40 h-40 object-contain drop-shadow-2xl"
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Damage Number */}
              <AnimatePresence>
                {showDamage?.target === 'enemy' && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -50, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute top-0 right-0 text-4xl font-black text-red-600"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* VS Indicator */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
            <span className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              VS
            </span>
          </div>
        </div>

        {/* Player Pokemon */}
        <div className="mb-8">
          {/* Player Pokemon Image */}
          <div className="relative flex justify-start mb-3">
            <motion.div
              animate={battlePhase === 'player-turn' && showDamage?.target === 'enemy' ? { x: [0, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img
                src={playerPokemon.image}
                alt={playerPokemon.name}
                className="w-40 h-40 object-contain drop-shadow-2xl"
                style={{ imageRendering: 'pixelated', transform: 'scaleX(-1)' }}
              />
              {/* Damage Number */}
              <AnimatePresence>
                {showDamage?.target === 'player' && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -50, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute top-0 left-0 text-4xl font-black text-red-600"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900 capitalize text-lg">
                  {playerPokemon.name}
                </h3>
                <p className="text-xs text-gray-600">Your Pokémon</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">
                  HP: {playerHP} / {playerMaxHP}
                </div>
              </div>
            </div>
            {/* HP Bar */}
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-all ${
                  playerHP > 50 ? 'bg-green-500' : playerHP > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: `${(playerHP / playerMaxHP) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {battlePhase === 'player-turn' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-4"
          >
            <button
              onClick={() => handleAction('attack')}
              className="bg-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Swords className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="font-bold text-gray-900 text-sm">Attack</div>
              <div className="text-xs text-gray-600">15-40 DMG</div>
            </button>

            <button
              onClick={() => handleAction('skill')}
              className="bg-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-bold text-gray-900 text-sm">Special</div>
              <div className="text-xs text-gray-600">25-65 DMG</div>
            </button>

            <button
              onClick={() => handleAction('defend')}
              className="bg-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-bold text-gray-900 text-sm">Defend</div>
              <div className="text-xs text-gray-600">-50% DMG</div>
            </button>
          </motion.div>
        )}

        {/* Enemy Turn Indicator */}
        {battlePhase === 'enemy-turn' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl mb-4 text-center"
          >
            <div className="text-lg font-bold text-gray-900">
              Enemy's Turn...
            </div>
          </motion.div>
        )}

        {/* Battle End */}
        {(battlePhase === 'player-won' || battlePhase === 'player-lost') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 shadow-2xl text-center"
          >
            <div className={`text-6xl mb-4`}>
              {battlePhase === 'player-won' ? '🎉' : '😢'}
            </div>
            <h2 className={`text-3xl font-black mb-2 ${
              battlePhase === 'player-won' ? 'text-green-600' : 'text-red-600'
            }`}>
              {battlePhase === 'player-won' ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {battlePhase === 'player-won' 
                ? `You defeated ${enemyPokemon.name}!` 
                : `${enemyPokemon.name} defeated you!`}
            </p>
            <button
              onClick={handleBattleEnd}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              {battlePhase === 'player-won' ? 'Capture Pokémon!' : 'Back to Menu'}
            </button>
          </motion.div>
        )}

        {/* Action Log */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">Battle Log</h4>
          <div className="space-y-1">
            {actionLog.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-gray-700"
              >
                → {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
