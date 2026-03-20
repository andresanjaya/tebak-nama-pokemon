import { useNavigate } from 'react-router';
import { PokedexHeader } from '../components/PokedexHeader';
import { Gamepad2, Swords, ArrowRight, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

export function GameMenuPage() {
  const navigate = useNavigate();

  const games = [
    {
      id: 'guess',
      title: 'Guess the Pokémon',
      description: 'Test your knowledge! Can you identify Pokémon from their silhouettes?',
      icon: Gamepad2,
      color: 'from-blue-500 to-purple-600',
      route: '/game/guess',
    },
    {
      id: 'battle',
      title: 'Battle & Capture',
      description: 'Battle wild Pokémon, capture them, and build your ultimate collection!',
      icon: Swords,
      color: 'from-red-500 to-orange-600',
      route: '/game/battle',
      badge: 'NEW',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Pokedex Header */}
      <PokedexHeader title="Game Center" />

      {/* Content */}
      <div className="p-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Choose Your Game
          </h2>
          <p className="text-gray-600">
            Select a game mode and start your adventure!
          </p>
        </div>

        {/* Game Cards */}
        <div className="space-y-4">
          {games.map((game, index) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(game.route)}
              className="w-full bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity`} /> 

              {/* Content */}
              <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <game.icon className="w-8 h-8 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-8 bg-white rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-black text-blue-600 mb-1">
                {localStorage.getItem('bestScore') || '0'}
              </div>
              <div className="text-xs text-gray-600">Best Quiz Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-2xl font-black text-red-600 mb-1">
                {localStorage.getItem('capturedCount') || '0'}
              </div>
              <div className="text-xs text-gray-600">Pokémon Captured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}