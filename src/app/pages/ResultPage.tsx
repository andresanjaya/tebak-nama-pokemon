import { useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trophy, Home, RotateCcw, Star } from 'lucide-react';
import { GameResult } from '../types/pokemon';
import { useEffect, useRef, useState } from 'react';
import { applyXpGain } from '../utils/playerProgress';
import { getGuessingXpBreakdown } from '../utils/expRewards';

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as GameResult;
  const [showConfetti, setShowConfetti] = useState(false);
  const xpAppliedRef = useRef(false);

  useEffect(() => {
    if (result && result.score >= result.totalQuestions * 0.7) {
      setShowConfetti(true);
    }
  }, [result]);

  if (!result) {
    navigate('/game/guess');
    return null;
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const xpBreakdown = getGuessingXpBreakdown(
    result.correctAnswers.length,
    result.incorrectAnswers.length,
    result.bestStreak ?? 0
  );

  useEffect(() => {
    if (xpAppliedRef.current) {
      return;
    }

    xpAppliedRef.current = true;

    const currentXP = parseInt(localStorage.getItem('playerXP') || '0');
    const currentLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const { newLevel, newXp } = applyXpGain(currentLevel, currentXP, xpBreakdown.totalXp);

    localStorage.setItem('playerLevel', newLevel.toString());
    localStorage.setItem('playerXP', newXp.toString());
  }, [xpBreakdown.totalXp]);
  
  const getRank = () => {
    if (percentage >= 90) return { title: 'Pokémon Master!', color: 'text-yellow-500', stars: 3 };
    if (percentage >= 70) return { title: 'Great Trainer!', color: 'text-orange-500', stars: 2 };
    if (percentage >= 50) return { title: 'Good Effort!', color: 'text-blue-500', stars: 1 };
    return { title: 'Keep Practicing!', color: 'text-gray-500', stars: 0 };
  };

  const rank = getRank();

  return (
    <div className="min-h-screen p-6 pb-24 flex flex-col">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
              }}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            />
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Trophy Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-6"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-bold mb-2 ${rank.color}`}
        >
          {rank.title}
        </motion.h1>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 mb-6"
        >
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 ${
                i < rank.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-xl w-full mb-6"
        >
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-2xl font-semibold text-gray-600">{percentage}%</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
              <span className="text-green-700 font-semibold">Correct</span>
              <span className="text-green-700 font-bold text-xl">{result.correctAnswers.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
              <span className="text-red-700 font-semibold">Incorrect</span>
              <span className="text-red-700 font-bold text-xl">{result.incorrectAnswers.length}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-5 shadow-md w-full mb-6"
        >
          <h3 className="font-bold mb-3">EXP Earned</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Correct Answers</span>
              <span className="font-semibold">+{xpBreakdown.correctXp} XP</span>
            </div>
            <div className="flex justify-between">
              <span>Participation</span>
              <span className="font-semibold">+{xpBreakdown.wrongXp} XP</span>
            </div>
            <div className="flex justify-between">
              <span>Best Streak Bonus</span>
              <span className="font-semibold">+{xpBreakdown.streakBonusXp} XP</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between font-bold text-blue-600">
              <span>Total</span>
              <span>+{xpBreakdown.totalXp} XP</span>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        {result.incorrectAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-white rounded-2xl p-5 shadow-md w-full mb-6"
          >
            <h3 className="font-bold mb-3">Missed Pokémon:</h3>
            <div className="flex flex-wrap gap-2">
              {result.incorrectAnswers.map((name, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-3"
      >
        <button
          onClick={() => navigate('/game/guess')}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold shadow-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Pokédex
        </button>
      </motion.div>
    </div>
  );
}