import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap, Sparkles, RefreshCw } from 'lucide-react';
import { Pokemon } from '../types/pokemon';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

// Roulette segments with damage values
const ROULETTE_SEGMENTS = [
  { value: 10, color: '#3B82F6', label: '10' },  // Blue
  { value: 20, color: '#10B981', label: '20' },  // Green
  { value: 30, color: '#F59E0B', label: '30' },  // Orange
  { value: 40, color: '#EF4444', label: '40' },  // Red
  { value: 50, color: '#8B5CF6', label: '50' },  // Purple
  { value: 10, color: '#3B82F6', label: '10' },  // Blue
  { value: 20, color: '#10B981', label: '20' },  // Green
  { value: 30, color: '#F59E0B', label: '30' },  // Orange
];

export function BattleFightPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [team, setTeam] = useState<CapturedPokemon[] | null>(null);
  const [enemy, setEnemy] = useState<Pokemon | null>(null);
  const [mode, setMode] = useState<string>('normal');
  const [firstAttackBonus, setFirstAttackBonus] = useState<boolean>(false);

  const [currentPokemonIndex, setCurrentPokemonIndex] = useState(0);
  
  // State that depends on team/enemy - initialized with fallback values
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(300);
  const [battlePhase, setBattlePhase] = useState<'player-turn' | 'enemy-turn' | 'roulette' | 'switching' | 'complete'>('player-turn');
  
  // Roulette State
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  const [showDamage, setShowDamage] = useState<{ target: 'player' | 'enemy'; amount: number; type: string } | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [firstAttackApplied, setFirstAttackApplied] = useState(false);

  // Define all functions BEFORE any useEffect that uses them
  const dealDamage = useCallback((target: 'player' | 'enemy', amount: number, type: string) => {
    if (!team || !enemy) return;

    setShowDamage({ target, amount, type });
    setTimeout(() => setShowDamage(null), 1500);

    if (target === 'enemy') {
      setEnemyHP(prev => {
        const newHP = Math.max(0, prev - amount);
        if (newHP <= 0) {
          // Battle won!
          setTimeout(() => {
            navigate('/game/battle/capture', {
              state: { pokemon: enemy, mode }
            });
          }, 2000);
        }
        return newHP;
      });
    } else {
      setPlayerHP(prev => {
        const newHP = Math.max(0, prev - amount);
        if (newHP <= 0) {
          // Battle lost - switch Pokemon or lose
          if (currentPokemonIndex < team.length - 1) {
            setTimeout(() => {
              setCurrentPokemonIndex(prev => prev + 1);
              setPlayerHP(100);
              setBattlePhase('player-turn');
            }, 2000);
          } else {
            // All Pokemon fainted - battle lost
            setTimeout(() => {
              navigate('/game/battle', {
                state: { battleResult: 'lost' }
              });
            }, 2000);
          }
        }
        return newHP;
      });
    }
  }, [team, enemy, mode, currentPokemonIndex, navigate]);

  const performEnemyAttack = useCallback(() => {
    const damage = Math.floor(Math.random() * 15) + 10;
    dealDamage('player', damage, 'Enemy Attack!');
    
    setTimeout(() => {
      setBattlePhase('player-turn');
      setTurnCount(prev => prev + 1);
    }, 2000);
  }, [dealDamage]);

  // Initialize state from location or sessionStorage
  useEffect(() => {
    let teamData = location.state?.team as CapturedPokemon[] | undefined;
    let enemyData = location.state?.enemy as Pokemon | undefined;
    let modeData = location.state?.mode as string | undefined;
    let bonusData = location.state?.firstAttackBonus as boolean | undefined;

    // Fallback to sessionStorage
    if (!teamData || !enemyData) {
      const savedTeam = sessionStorage.getItem('battleTeam');
      const savedEnemy = sessionStorage.getItem('battleEnemy');
      const savedMode = sessionStorage.getItem('battleMode');
      const savedBonus = sessionStorage.getItem('firstAttackBonus');
      
      if (savedTeam && savedEnemy) {
        teamData = JSON.parse(savedTeam);
        enemyData = JSON.parse(savedEnemy);
        modeData = savedMode || 'normal';
        bonusData = savedBonus ? JSON.parse(savedBonus) : false;
        console.log('BattleFightPage - Retrieved from sessionStorage');
      }
    }

    console.log('=== BattleFightPage mounted ===');
    console.log('Team:', teamData?.length);
    console.log('Enemy:', enemyData?.name);
    console.log('Mode:', modeData);
    console.log('First attack bonus:', bonusData);

    if (!teamData || !enemyData) {
      console.error('❌ No team or enemy in BattleFightPage');
      console.error('Redirecting back...');
      
      setTimeout(() => {
        navigate('/game/battle', { replace: true });
      }, 100);
      return;
    }

    setTeam(teamData);
    setEnemy(enemyData);
    setMode(modeData || 'normal');
    setFirstAttackBonus(bonusData || false);
    
    // Initialize HP values based on loaded data
    const initialMaxPlayerHP = teamData[0]?.stats?.hp || 100;
    const initialMaxEnemyHP = (enemyData?.stats?.hp || 100) * 3;
    setPlayerHP(initialMaxPlayerHP);
    setEnemyHP(initialMaxEnemyHP);
  }, [location, navigate]);

  // Roulette auto-spin animation
  useEffect(() => {
    if (battlePhase === 'roulette' && isSpinning) {
      const interval = setInterval(() => {
        setRouletteRotation(prev => (prev + 8) % 360);
      }, 16);

      return () => clearInterval(interval);
    }
  }, [battlePhase, isSpinning]);

  // Enemy Turn
  useEffect(() => {
    if (battlePhase === 'enemy-turn' && enemyHP > 0 && team && enemy) {
      const timer = setTimeout(() => {
        performEnemyAttack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battlePhase, enemyHP, team, enemy, performEnemyAttack]);

  // First attack bonus
  useEffect(() => {
    if (firstAttackBonus && team && enemy && !firstAttackApplied && team.length > 0) {
      // Player gets first free hit
      const timer = setTimeout(() => {
        const damage = 15;
        dealDamage('enemy', damage, 'First Attack Bonus!');
        setFirstAttackApplied(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [firstAttackBonus, team, enemy, firstAttackApplied, dealDamage]);

  // Return early only AFTER all hooks
  if (!team || !enemy) {
    return null;
  }

  // Now it's safe to access team[currentPokemonIndex]
  const currentPokemon = team[currentPokemonIndex];
  const maxPlayerHP = currentPokemon?.stats?.hp || 100;
  const maxEnemyHP = (enemy?.stats?.hp || 100) * 3; // 3x HP for 3 vs 1

  const handleAttackClick = () => {
    if (battlePhase !== 'player-turn') return;
    
    setBattlePhase('roulette');
    setIsSpinning(true);
    setSelectedSegment(null);
  };

  const handleRouletteStop = () => {
    if (!isSpinning) return;
    
    setIsSpinning(false);
    
    // Calculate which segment was selected based on rotation
    const segmentAngle = 360 / ROULETTE_SEGMENTS.length;
    const normalizedRotation = ((360 - (rouletteRotation % 360)) + segmentAngle / 2) % 360;
    const segmentIndex = Math.floor(normalizedRotation / segmentAngle) % ROULETTE_SEGMENTS.length;
    
    setSelectedSegment(segmentIndex);
    
    const selectedValue = ROULETTE_SEGMENTS[segmentIndex].value;
    
    console.log('Roulette stopped at segment:', segmentIndex, 'Value:', selectedValue);
    
    // Deal damage after showing result
    setTimeout(() => {
      dealDamage('enemy', selectedValue, `${selectedValue} Damage!`);
      
      // Transition to enemy turn
      setTimeout(() => {
        if (enemyHP - selectedValue > 0) {
          setBattlePhase('enemy-turn');
        }
        setSelectedSegment(null);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black flex flex-col p-4">
      {/* Battle Info Header */}
      <div className="flex justify-between items-start mb-4">
        {/* Player Pokemon */}
        <div className="flex-1">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <img
                src={currentPokemon.image}
                alt={currentPokemon.name}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <h3 className="text-white font-bold capitalize text-sm">{currentPokemon.name}</h3>
                <div className="text-xs text-white/80">Lv. {Math.floor(currentPokemon.stats.hp / 10)}</div>
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="bg-white/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(playerHP / maxPlayerHP) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-white text-xs text-right mt-1">HP: {playerHP}/{maxPlayerHP}</div>
          </motion.div>
        </div>

        {/* Enemy Pokemon */}
        <div className="flex-1">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-3 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2 flex-row-reverse">
              <img
                src={enemy.image}
                alt={enemy.name}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="text-right">
                <h3 className="text-white font-bold capitalize text-sm">{enemy.name}</h3>
                <div className="text-xs text-white/80">Lv. {Math.floor(enemy.stats.hp / 10)}</div>
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="bg-white/30 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(enemyHP / maxEnemyHP) * 100}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-600"
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-white text-xs text-right mt-1">HP: {enemyHP}/{maxEnemyHP}</div>
          </motion.div>
        </div>
      </div>

      {/* Battle Scene */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Pokemon Images */}
        <div className="absolute inset-0 flex items-center justify-between px-8">
          {/* Player Pokemon */}
          <motion.div
            animate={{ 
              y: battlePhase === 'player-turn' || battlePhase === 'roulette' ? [0, -10, 0] : 0,
              scale: showDamage?.target === 'player' ? 0.9 : 1
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5 },
              scale: { duration: 0.2 }
            }}
            className="relative"
          >
            <img
              src={currentPokemon.image}
              alt={currentPokemon.name}
              className="w-32 h-32 object-contain drop-shadow-2xl"
              style={{ imageRendering: 'pixelated' }}
            />
          </motion.div>

          {/* Enemy Pokemon */}
          <motion.div
            animate={{ 
              y: battlePhase === 'enemy-turn' ? [0, -10, 0] : 0,
              scale: showDamage?.target === 'enemy' ? 0.9 : 1
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5 },
              scale: { duration: 0.2 }
            }}
            className="relative"
          >
            <img
              src={enemy.image}
              alt={enemy.name}
              className="w-32 h-32 object-contain drop-shadow-2xl"
              style={{ imageRendering: 'pixelated' }}
            />
          </motion.div>
        </div>

        {/* Damage Numbers */}
        <AnimatePresence>
          {showDamage && (
            <motion.div
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1.5, y: -50 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute ${
                showDamage.target === 'enemy' ? 'right-1/4' : 'left-1/4'
              } top-1/3 z-10`}
            >
              <div className="text-5xl font-black text-yellow-400 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(250,204,21,0.8), 0 4px 0 #000' }}>
                -{showDamage.amount}
              </div>
              <div className="text-sm font-bold text-white text-center mt-1">
                {showDamage.type}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Roulette Wheel */}
      {battlePhase === 'roulette' && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="relative flex flex-col items-center">
            {/* Instruction */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-white font-bold mb-4 text-lg"
            >
              {isSpinning ? '🎯 TAP TO STOP!' : 'Tap SMASH to spin!'}
            </motion.div>

            {/* Roulette Container */}
            <div className="relative w-80 h-80">
              {/* Pointer/Indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-20">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg" 
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
                />
              </div>

              {/* Roulette Wheel */}
              <div className="relative w-full h-full">
                <motion.div
                  animate={{ rotate: rouletteRotation }}
                  transition={{ duration: 0, ease: 'linear' }}
                  className="absolute inset-0"
                  style={{ transformOrigin: 'center' }}
                >
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Outer ring border */}
                    <circle cx="200" cy="200" r="195" fill="none" stroke="#ffffff" strokeWidth="6" />
                    
                    {ROULETTE_SEGMENTS.map((segment, index) => {
                      const segmentAngle = 360 / ROULETTE_SEGMENTS.length;
                      const startAngle = index * segmentAngle - 90; // Start from top
                      const endAngle = startAngle + segmentAngle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      
                      const outerRadius = 190;
                      const innerRadius = 60;
                      
                      // Outer arc points
                      const x1 = 200 + outerRadius * Math.cos(startRad);
                      const y1 = 200 + outerRadius * Math.sin(startRad);
                      const x2 = 200 + outerRadius * Math.cos(endRad);
                      const y2 = 200 + outerRadius * Math.sin(endRad);
                      
                      // Inner arc points
                      const x3 = 200 + innerRadius * Math.cos(endRad);
                      const y3 = 200 + innerRadius * Math.sin(endRad);
                      const x4 = 200 + innerRadius * Math.cos(startRad);
                      const y4 = 200 + innerRadius * Math.sin(startRad);
                      
                      const isSelected = selectedSegment === index;
                      
                      // Text position (middle of segment)
                      const midAngle = (startAngle + endAngle) / 2;
                      const midRad = (midAngle * Math.PI) / 180;
                      const textRadius = (outerRadius + innerRadius) / 2;
                      const textX = 200 + textRadius * Math.cos(midRad);
                      const textY = 200 + textRadius * Math.sin(midRad);
                      
                      return (
                        <g key={index}>
                          {/* Segment path */}
                          <path
                            d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`}
                            fill={isSelected ? '#FFD700' : segment.color}
                            stroke="#ffffff"
                            strokeWidth="4"
                            style={{
                              filter: isSelected ? 'drop-shadow(0 0 15px rgba(255,215,0,0.9))' : 'none'
                            }}
                          />
                          
                          {/* Segment value text */}
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize="40"
                            fontWeight="900"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ 
                              textShadow: '0 3px 6px rgba(0,0,0,0.9)',
                              paintOrder: 'stroke',
                              stroke: '#000',
                              strokeWidth: '3px'
                            }}
                          >
                            {segment.label}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Inner circle border */}
                    <circle cx="200" cy="200" r="65" fill="none" stroke="#ffffff" strokeWidth="6" />
                  </svg>
                </motion.div>

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-10">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {battlePhase === 'player-turn' && (
          <>
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={handleAttackClick}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-2xl py-6 rounded-2xl shadow-lg hover:shadow-2xl active:scale-95 transition-all border-4 border-white/30"
            >
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8" />
                <span>ATTACK!</span>
              </div>
            </motion.button>

            {/* Switch Pokemon Button */}
            {team.length > 1 && (
              <motion.button
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setShowSwitchModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all border-2 border-white/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Switch Pokémon</span>
                </div>
              </motion.button>
            )}
          </>
        )}

        {battlePhase === 'roulette' && (
          <motion.button
            animate={{ 
              scale: isSpinning ? [1, 1.05, 1] : 1,
              boxShadow: isSpinning 
                ? ['0 0 20px rgba(250,204,21,0.5)', '0 0 40px rgba(250,204,21,0.8)', '0 0 20px rgba(250,204,21,0.5)']
                : '0 10px 25px rgba(0,0,0,0.3)'
            }}
            transition={{ 
              scale: { repeat: Infinity, duration: 0.5 },
              boxShadow: { repeat: Infinity, duration: 1 }
            }}
            onClick={isSpinning ? handleRouletteStop : handleAttackClick}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black text-3xl py-8 rounded-2xl shadow-2xl active:scale-95 transition-all border-4 border-white"
          >
            {isSpinning ? '🎯 SMASH!' : '🔄 SPIN'}
          </motion.button>
        )}

        {battlePhase === 'enemy-turn' && (
          <div className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-xl py-6 rounded-2xl text-center opacity-75">
            Enemy's Turn...
          </div>
        )}
      </div>

      {/* Turn Counter */}
      <div className="text-center text-white/60 text-sm mt-2">
        Turn {turnCount + 1}
      </div>

      {/* Switch Pokemon Modal */}
      <AnimatePresence>
        {showSwitchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSwitchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-4">Switch Pokémon</h2>
              
              <div className="space-y-3">
                {team.map((pokemon, index) => {
                  const isCurrentPokemon = index === currentPokemonIndex;
                  const isFainted = index < currentPokemonIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isCurrentPokemon && !isFainted) {
                          const newPokemon = team[index];
                          const newMaxHP = newPokemon?.stats?.hp || 100;
                          setCurrentPokemonIndex(index);
                          setPlayerHP(newMaxHP);
                          setShowSwitchModal(false);
                          // Enemy attacks after switching
                          setTimeout(() => {
                            setBattlePhase('enemy-turn');
                          }, 1000);
                        }
                      }}
                      disabled={isCurrentPokemon || isFainted}
                      className={`w-full p-4 rounded-2xl transition-all flex items-center gap-4 ${
                        isCurrentPokemon
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : isFainted
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className={`w-16 h-16 object-contain ${isFainted ? 'grayscale' : ''}`}
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 capitalize">
                          {pokemon.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Lv. {Math.floor(pokemon.stats.hp / 10)}
                        </p>
                        {isCurrentPokemon && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">
                            ACTIVE
                          </span>
                        )}
                        {isFainted && (
                          <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full font-bold">
                            FAINTED
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}