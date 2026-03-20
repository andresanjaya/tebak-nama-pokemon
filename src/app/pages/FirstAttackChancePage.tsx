import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Target } from 'lucide-react';
import { Pokemon } from '../types/pokemon';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

export function FirstAttackChancePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [team, setTeam] = useState<CapturedPokemon[] | null>(null);
  const [enemy, setEnemy] = useState<Pokemon | null>(null);
  const [mode, setMode] = useState<string>('normal');

  const [meterValue, setMeterValue] = useState(0);
  const [meterDirection, setMeterDirection] = useState<'up' | 'down'>('up');
  const [attemptMade, setAttemptMade] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  const successZoneStart = 35;
  const successZoneEnd = 65;

  // Initialize state from location or sessionStorage
  useEffect(() => {
    let teamData = location.state?.team as CapturedPokemon[] | undefined;
    let enemyData = location.state?.enemy as Pokemon | undefined;
    let modeData = location.state?.mode as string | undefined;

    // Fallback to sessionStorage
    if (!teamData || !enemyData) {
      const savedTeam = sessionStorage.getItem('battleTeam');
      const savedEnemy = sessionStorage.getItem('battleEnemy');
      const savedMode = sessionStorage.getItem('battleMode');
      
      if (savedTeam && savedEnemy) {
        teamData = JSON.parse(savedTeam);
        enemyData = JSON.parse(savedEnemy);
        modeData = savedMode || 'normal';
        console.log('FirstAttackChancePage - Retrieved from sessionStorage');
      }
    }

    console.log('=== FirstAttackChancePage mounted ===');
    console.log('Team:', teamData?.length);
    console.log('Enemy:', enemyData?.name);
    console.log('Mode:', modeData);

    if (!teamData || !enemyData) {
      console.error('❌ No team or enemy in FirstAttackChancePage');
      console.error('Redirecting back...');
      
      setTimeout(() => {
        navigate('/game/battle', { replace: true });
      }, 100);
      return;
    }

    setTeam(teamData);
    setEnemy(enemyData);
    setMode(modeData || 'normal');
  }, [location, navigate]);

  // Meter animation
  useEffect(() => {
    if (!attemptMade && team && enemy) {
      const interval = setInterval(() => {
        setMeterValue(prev => {
          if (meterDirection === 'up') {
            if (prev >= 100) {
              setMeterDirection('down');
              return 100;
            }
            return prev + 3;
          } else {
            if (prev <= 0) {
              setMeterDirection('up');
              return 0;
            }
            return prev - 3;
          }
        });
      }, 20);

      return () => clearInterval(interval);
    }
  }, [attemptMade, meterDirection, team, enemy]);

  if (!team || !enemy) {
    return null;
  }

  const handleAttempt = () => {
    if (attemptMade) return;

    setAttemptMade(true);

    // Check if in success zone
    const inSuccessZone = meterValue >= successZoneStart && meterValue <= successZoneEnd;
    setResult(inSuccessZone ? 'success' : 'fail');

    console.log('First attack attempt result:', inSuccessZone ? 'SUCCESS' : 'FAIL');

    // Proceed to battle after showing result
    setTimeout(() => {
      // Save to sessionStorage before navigating
      if (team && enemy) {
        sessionStorage.setItem('battleTeam', JSON.stringify(team));
        sessionStorage.setItem('battleEnemy', JSON.stringify(enemy));
        sessionStorage.setItem('battleMode', mode || 'normal');
        sessionStorage.setItem('firstAttackBonus', JSON.stringify(inSuccessZone));
      }

      navigate('/game/battle/fight', {
        state: {
          team,
          enemy,
          mode,
          firstAttackBonus: inSuccessZone,
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 via-red-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Title */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -2, 2, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mb-8"
          >
            <h1 
              className="text-6xl font-black text-white mb-2"
              style={{ 
                textShadow: '0 0 20px rgba(255,255,255,0.5), 0 4px 0 rgba(0,0,0,0.3)',
                WebkitTextStroke: '2px rgba(0,0,0,0.2)',
              }}
            >
              FIRST ATTACK
            </h1>
            <h2 
              className="text-7xl font-black text-yellow-300"
              style={{ 
                textShadow: '0 0 30px rgba(253,224,71,0.8), 0 4px 0 rgba(0,0,0,0.3)',
                WebkitTextStroke: '3px rgba(0,0,0,0.2)',
              }}
            >
              CHANCE!
            </h2>
          </motion.div>

          {/* Timing Meter */}
          {!attemptMade && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-black text-gray-900">
                  TAP WHEN GREEN!
                </h3>
              </div>

              {/* Meter Container */}
              <div className="relative h-16 bg-gray-300 rounded-2xl overflow-hidden mb-6 border-4 border-gray-400">
                {/* Success Zone */}
                <div 
                  className="absolute h-full bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-80"
                  style={{ 
                    left: `${successZoneStart}%`,
                    width: `${successZoneEnd - successZoneStart}%`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-black text-sm">PERFECT!</span>
                  </div>
                </div>
                
                {/* Moving Indicator */}
                <motion.div
                  className="absolute top-0 bottom-0 w-3 bg-gradient-to-b from-purple-600 via-pink-600 to-red-600 shadow-lg"
                  style={{ left: `${meterValue}%` }}
                  animate={{ boxShadow: ['0 0 10px rgba(139,92,246,0.5)', '0 0 20px rgba(139,92,246,1)', '0 0 10px rgba(139,92,246,0.5)'] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              </div>

              <motion.button
                onClick={handleAttempt}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-black py-6 rounded-2xl shadow-2xl text-2xl"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Zap className="w-8 h-8" />
                  <span>TAP NOW!</span>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Result Display */}
          {attemptMade && result && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`rounded-3xl p-12 shadow-2xl ${
                result === 'success'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 3, duration: 0.3 }}
                className="text-9xl mb-4"
              >
                {result === 'success' ? '⚡' : '💫'}
              </motion.div>

              <h2 
                className="text-5xl font-black text-white mb-3"
                style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
              >
                {result === 'success' ? 'PERFECT!' : 'MISSED!'}
              </h2>

              <p className="text-white/90 text-xl font-bold">
                {result === 'success' 
                  ? 'You strike first!' 
                  : 'Enemy moves first!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}