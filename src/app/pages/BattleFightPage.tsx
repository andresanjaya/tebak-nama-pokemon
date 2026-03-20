import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RefreshCw, ArrowLeft } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { PokedexHeader } from '../components/PokedexHeader';
import {
  BattleMove,
  fetchPokemonBattleMoves,
  getTypeEffectivenessMultiplier,
} from '../services/pokeapi';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

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
  const [battlePhase, setBattlePhase] = useState<'player-turn' | 'enemy-turn' | 'complete'>('player-turn');

  const [showDamage, setShowDamage] = useState<{ target: 'player' | 'enemy'; amount: number; type: string } | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [firstAttackApplied, setFirstAttackApplied] = useState(false);
  const [currentMoveLabel, setCurrentMoveLabel] = useState<string | null>(null);
  const [playerMoves, setPlayerMoves] = useState<BattleMove[]>([]);
  const [enemyMoves, setEnemyMoves] = useState<BattleMove[]>([]);
  const [loadingMoves, setLoadingMoves] = useState(false);

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

  const calculateMoveDamage = useCallback(async (
    attacker: Pokemon,
    defender: Pokemon,
    move: BattleMove
  ) => {
    const isPhysical = move.damageClass === 'physical';
    const attackStat = isPhysical ? (attacker.stats?.attack ?? 50) : (attacker.stats?.specialAttack ?? 50);
    const defenseStat = isPhysical ? (defender.stats?.defense ?? 50) : (defender.stats?.specialDefense ?? 50);
    const hp = attacker.stats?.hp ?? 50;
    const attack = attacker.stats?.attack ?? 50;
    const speed = attacker.stats?.speed ?? 50;
    const attackerLevel = Math.max(30, Math.floor((hp + attack + speed) / 6));
    const stab = (attacker.types ?? []).includes(move.type) ? 1.5 : 1;
    const effectiveness = await getTypeEffectivenessMultiplier(move.type, defender.types ?? ['normal']);
    const randomFactor = 0.85 + Math.random() * 0.15;

    const base = (((2 * attackerLevel) / 5 + 2) * (move.power ?? 50) * (attackStat / Math.max(1, defenseStat))) / 50 + 2;
    const rawDamage = Math.floor(base * stab * effectiveness * randomFactor);
    const damage = Math.max(1, rawDamage);

    let effectivenessText = 'Normal hit';
    if (effectiveness === 0) {
      effectivenessText = 'No effect';
    } else if (effectiveness > 1) {
      effectivenessText = 'Super effective';
    } else if (effectiveness < 1) {
      effectivenessText = 'Not very effective';
    }

    return {
      damage,
      effectivenessText,
    };
  }, []);

  const performEnemyAttack = useCallback(async () => {
    if (!team || !enemy || enemyMoves.length === 0) {
      setBattlePhase('player-turn');
      return;
    }

    const attacker = team[currentPokemonIndex];
    if (!attacker) {
      setBattlePhase('player-turn');
      return;
    }

    const move = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
    const { damage, effectivenessText } = await calculateMoveDamage(enemy, attacker, move);

    setCurrentMoveLabel(`${enemy.name} used ${move.name.replace(/-/g, ' ')}`);
    dealDamage('player', damage, `${effectivenessText}!`);

    setTimeout(() => {
      setBattlePhase('player-turn');
      setTurnCount(prev => prev + 1);
      setCurrentMoveLabel(null);
    }, 2000);
  }, [team, currentPokemonIndex, enemy, enemyMoves, calculateMoveDamage, dealDamage]);

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

  // Enemy Turn
  useEffect(() => {
    if (battlePhase === 'enemy-turn' && enemyHP > 0 && team && enemy) {
      const timer = setTimeout(() => {
        performEnemyAttack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battlePhase, enemyHP, team, enemy, performEnemyAttack]);

  // Load battle moves for current player Pokemon and enemy.
  useEffect(() => {
    if (!team || !enemy) {
      return;
    }

    const currentPokemon = team[currentPokemonIndex];
    if (!currentPokemon) {
      return;
    }

    let isCancelled = false;
    const loadMoves = async () => {
      setLoadingMoves(true);
      try {
        const [loadedPlayerMoves, loadedEnemyMoves] = await Promise.all([
          fetchPokemonBattleMoves(currentPokemon.id, currentPokemon.types),
          fetchPokemonBattleMoves(enemy.id, enemy.types),
        ]);

        if (!isCancelled) {
          setPlayerMoves(loadedPlayerMoves);
          setEnemyMoves(loadedEnemyMoves);
        }
      } catch (error) {
        console.error('Failed to load battle moves:', error);
        if (!isCancelled) {
          setPlayerMoves([]);
          setEnemyMoves([]);
        }
      } finally {
        if (!isCancelled) {
          setLoadingMoves(false);
        }
      }
    };

    loadMoves();

    return () => {
      isCancelled = true;
    };
  }, [team, currentPokemonIndex, enemy]);

  // First attack bonus
  useEffect(() => {
    if (firstAttackBonus && team && enemy && !firstAttackApplied && team.length > 0 && playerMoves.length > 0) {
      // Player gets first free hit
      const attacker = team[currentPokemonIndex];
      if (!attacker) {
        return;
      }

      const timer = setTimeout(async () => {
        const move = playerMoves[Math.floor(Math.random() * playerMoves.length)];
        const { damage, effectivenessText } = await calculateMoveDamage(attacker, enemy, move);
        const boostedDamage = Math.max(1, Math.floor(damage * 1.2));
        setCurrentMoveLabel(`${attacker.name} used ${move.name.replace(/-/g, ' ')} (First Attack Bonus)`);
        dealDamage('enemy', boostedDamage, `${effectivenessText}!`);
        setFirstAttackApplied(true);
        setTimeout(() => {
          setCurrentMoveLabel(null);
        }, 1200);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [firstAttackBonus, team, currentPokemonIndex, enemy, firstAttackApplied, playerMoves, calculateMoveDamage, dealDamage]);

  // Return early only AFTER all hooks
  if (!team || !enemy) {
    return null;
  }

  // Now it's safe to access team[currentPokemonIndex]
  const currentPokemon = team[currentPokemonIndex];
  const maxPlayerHP = currentPokemon?.stats?.hp || 100;
  const maxEnemyHP = (enemy?.stats?.hp || 100) * 3; // 3x HP for 3 vs 1

  const handleAttackClick = async () => {
    if (battlePhase !== 'player-turn' || loadingMoves || playerMoves.length === 0) {
      return;
    }

    const move = playerMoves[Math.floor(Math.random() * playerMoves.length)];
    const { damage, effectivenessText } = await calculateMoveDamage(currentPokemon, enemy, move);

    setCurrentMoveLabel(`${currentPokemon.name} used ${move.name.replace(/-/g, ' ')}`);
    dealDamage('enemy', damage, `${effectivenessText}!`);

    setTimeout(() => {
      if (enemyHP - damage > 0) {
        setBattlePhase('enemy-turn');
      }
      setCurrentMoveLabel(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black flex flex-col">
      {/* Pokedex Header */}
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

      {/* Battle Content */}
      <div className="flex flex-col p-4">
        <div className="flex justify-between items-start mb-6 gap-4">
          {/* Player Pokemon */}
          <div className="flex-1 pr-2">
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
        <div className="flex-1 pl-2">
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
      <div className="relative flex-1 min-h-[180px] sm:min-h-[220px] mb-4">
        {/* Pokemon Images */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 sm:px-10">
          {/* Player Pokemon */}
          <motion.div
            animate={{ 
              y: battlePhase === 'player-turn' ? [0, -10, 0] : 0,
              scale: showDamage?.target === 'player' ? 0.9 : 1
            }}
            transition={{ 
              y: { repeat: Infinity, duration: 1.5 },
              scale: { duration: 0.2 }
            }}
            className="relative w-[42%] flex justify-start"
          >
            <img
              src={currentPokemon.image}
              alt={currentPokemon.name}
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl"
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
            className="relative w-[42%] flex justify-end"
          >
            <img
              src={enemy.image}
              alt={enemy.name}
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl"
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
              } top-8 z-10`}
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

      {currentMoveLabel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center text-white font-bold text-lg"
        >
          {currentMoveLabel}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mt-4 pb-1">
        {battlePhase === 'player-turn' && (
          <>
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={handleAttackClick}
              disabled={loadingMoves || playerMoves.length === 0}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-2xl py-6 rounded-2xl shadow-lg hover:shadow-2xl active:scale-95 transition-all border-4 border-white/30"
            >
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8" />
                <span>{loadingMoves ? 'Loading Moves...' : 'ATTACK!'}</span>
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
    </div>
  );
}