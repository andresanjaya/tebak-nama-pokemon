import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { PokedexHeader } from '../components/PokedexHeader';

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

  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<'heads' | 'tails' | null>(null);

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

  if (!team || !enemy) {
    return null;
  }

  const handleFlipCoin = () => {
    if (isFlipping || flipResult) return;

    setIsFlipping(true);

    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';

    setTimeout(() => {
      setFlipResult(result);
      setIsFlipping(false);
    }, 1300);

    // Proceed to battle after showing result
    setTimeout(() => {
      const firstAttackBonus = result === 'heads';

      // Save to sessionStorage before navigating
      if (team && enemy) {
        sessionStorage.setItem('battleTeam', JSON.stringify(team));
        sessionStorage.setItem('battleEnemy', JSON.stringify(enemy));
        sessionStorage.setItem('battleMode', mode || 'normal');
        sessionStorage.setItem('firstAttackBonus', JSON.stringify(firstAttackBonus));
      }

      navigate('/game/battle/fight', {
        state: {
          team,
          enemy,
          mode,
          firstAttackBonus,
        }
      });
    }, 3200);
  };

  return (
    <div className="min-h-screen pb-20 bg-[linear-gradient(180deg,#73dee3_0%,#b9e4db_35%,#b3e073_58%,#68d7bb_74%,#48ae4e_100%)]">
      <PokedexHeader
        leftButton={
          <button
            onClick={() => navigate('/game/battle/encounter')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
        }
      />

      <div className="w-full px-4 pt-4">
        <div className="w-full max-w-md space-y-3">
          <div className="relative rounded-2xl border-4 border-[#23233f] bg-[#9fd2d6] overflow-hidden shadow-xl p-6">
            <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#78c35f]" />

            <div className="relative text-center mb-4 z-10">
              <h1 className="text-3xl font-black text-[#1f1e2d]">COIN FLIP</h1>
              <p className="text-[#1f1e2d] font-semibold">Heads: going first • Tails: going second</p>
            </div>

            <div className="relative flex items-center justify-center min-h-[190px] z-10">
              <motion.div
                animate={isFlipping ? { rotateY: [0, 180, 360, 540, 720], y: [0, -25, 0] } : { rotateY: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="w-36 h-36 rounded-full bg-[#f2ca45] border-4 border-[#2d2a43] shadow-[0_6px_0_#987f2c] flex items-center justify-center"
              >
                <span className="text-4xl font-black text-[#2d2a43]">{flipResult === 'tails' ? 'T' : 'H'}</span>
              </motion.div>
            </div>

            {flipResult && (
              <div className="relative mt-4 text-center bg-[#f5f3de] border-2 border-[#2d2a43] rounded-xl py-3 z-10">
                <p className="text-xl font-black text-[#1f1e2d]">{flipResult.toUpperCase()}</p>
                <p className="text-sm font-bold text-[#2d2a43]">
                  {flipResult === 'heads' ? 'You are going first!' : 'Enemy is going first!'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleFlipCoin}
            disabled={isFlipping || !!flipResult}
            className="w-full bg-[#db5b34] border-2 border-[#2d2a43] text-white font-black py-4 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isFlipping ? 'Flipping...' : flipResult ? 'Battle Starting...' : 'Flip Coin'}
          </button>
        </div>
      </div>
    </div>
  );
}