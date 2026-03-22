import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, SkipForward, Clock } from 'lucide-react';
import { fetchRandomPokemon } from '../services/pokeapi';
import { Pokemon, GameQuestion } from '../types/pokemon';
import { PokedexHeader } from '../components/PokedexHeader';

export function GamePage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<Pokemon | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [imageRevealed, setImageRevealed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(5);

  const totalQuestions = 10;
  const questionTimeLimit = 5; // 5 seconds per question

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Fetch 40 random Pokemon (10 questions x 4 options)
        const randomPokemon = await fetchRandomPokemon(40);
        
        // Generate questions
        const generatedQuestions: GameQuestion[] = [];
        for (let i = 0; i < totalQuestions; i++) {
          const startIdx = i * 4;
          const options = randomPokemon.slice(startIdx, startIdx + 4);
          const correctPokemon = options[Math.floor(Math.random() * 4)];
          
          generatedQuestions.push({
            correctPokemon,
            options: options.sort(() => Math.random() - 0.5),
          });
        }
        
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        // Fallback to home if API fails
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [navigate]);

  // Reset timer when question changes
  useEffect(() => {
    if (!loading && !showFeedback) {
      setTimeLeft(questionTimeLimit);
    }
  }, [currentQuestion, loading, showFeedback]);

  // Timer effect
  useEffect(() => {
    if (loading || showFeedback) return;

    if (timeLeft <= 0) {
      // Time's up - treat as skip
      handleSkip();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, showFeedback]);

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  const handleSkip = () => {
    if (showFeedback) return;
    
    setShowFeedback(true);
    setImageRevealed(true);
    setStreak(0);
    setIncorrectAnswers([...incorrectAnswers, question.correctPokemon.name]);

    setTimeout(() => {
      if (currentQuestion + 1 >= totalQuestions) {
        navigate('/game/guess/results', {
          state: {
            score,
            totalQuestions,
            correctAnswers,
            incorrectAnswers: [...incorrectAnswers, question.correctPokemon.name],
            bestStreak,
          },
        });
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setImageRevealed(false);
      }
    }, 2000);
  };

  const handleAnswer = (pokemon: Pokemon) => {
    if (showFeedback) return;

    setSelectedAnswer(pokemon);
    setShowFeedback(true);
    setImageRevealed(true);

    const isCorrect = pokemon.id === question.correctPokemon.id;
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setBestStreak(Math.max(bestStreak, streak + 1));
      setCorrectAnswers([...correctAnswers, question.correctPokemon.name]);
    } else {
      setStreak(0);
      setIncorrectAnswers([...incorrectAnswers, question.correctPokemon.name]);
    }

    setTimeout(() => {
      if (currentQuestion + 1 >= totalQuestions) {
        navigate('/game/guess/results', {
          state: {
            score: isCorrect ? score + 1 : score,
            totalQuestions,
            correctAnswers: isCorrect 
              ? [...correctAnswers, question.correctPokemon.name]
              : correctAnswers,
            incorrectAnswers: isCorrect
              ? incorrectAnswers
              : [...incorrectAnswers, question.correctPokemon.name],
            bestStreak: isCorrect ? Math.max(bestStreak, streak + 1) : bestStreak,
          },
        });
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setImageRevealed(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pokedex Header */}
      <PokedexHeader title="Guess the Pokémon!" />

      {/* Content */}
      <div className="p-4">
        {/* Stats Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-900">Score: {score}</span>
            </div>
            
            {/* Timer Display */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition-colors ${
              timeLeft <= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-900'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="font-bold text-gray-600">
                {currentQuestion + 1} / {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                Streak
              </div>
              <div className="font-bold text-orange-500">{streak}</div>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Best Streak</div>
              <div className="font-bold text-gray-900">{bestStreak}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-5 shadow-xl mb-4"
          >
            <h2 className="text-center text-xl font-bold mb-4">Who's that Pokémon?</h2>
            
            <div className="aspect-square bg-gradient-to-br from-yellow-50 to-red-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
              <img
                src={question.correctPokemon.image}
                alt="Mystery Pokemon"
                className={`w-3/4 h-3/4 object-contain transition-all duration-500 ${
                  imageRevealed ? 'brightness-100' : 'brightness-0'
                }`}
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((pokemon) => {
                const isSelected = selectedAnswer?.id === pokemon.id;
                const isCorrect = pokemon.id === question.correctPokemon.id;
                
                let buttonClass = 'bg-gray-100 text-gray-900 hover:bg-gray-200';
                
                if (showFeedback) {
                  if (isCorrect) {
                    buttonClass = 'bg-green-500 text-white';
                  } else if (isSelected) {
                    buttonClass = 'bg-red-500 text-white';
                  } else {
                    buttonClass = 'bg-gray-100 text-gray-400';
                  }
                }

                return (
                  <motion.button
                    key={pokemon.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(pokemon)}
                    disabled={showFeedback}
                    className={`${buttonClass} py-4 rounded-xl font-semibold transition-all disabled:cursor-not-allowed capitalize`}
                  >
                    {pokemon.name}
                  </motion.button>
                );
              })}
            </div>

            {/* Skip Button */}
            {!showFeedback && (
              <div className="mt-3 text-center">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 py-2 px-4 rounded-xl font-semibold transition-all text-sm flex items-center gap-1 mx-auto"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Question
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`text-center py-4 rounded-2xl font-bold text-lg ${
                selectedAnswer?.id === question.correctPokemon.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {selectedAnswer?.id === question.correctPokemon.id ? (
                <span>✓ Correct! It's {question.correctPokemon.name}!</span>
              ) : (
                <span>✗ Wrong! It was {question.correctPokemon.name}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}