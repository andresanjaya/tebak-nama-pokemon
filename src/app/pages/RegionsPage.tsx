import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Pokemon } from '../types/pokemon';
import { readCapturedPokemonFromStorage } from '../utils/capturedPokemonProgress';

interface CapturedPokemon extends Pokemon {
  rarity: number;
  capturedAt: string;
  mode: string;
}

// Region data with starters
const REGIONS = [
  {
    id: 'kanto',
    name: 'KANTO',
    generation: 'Generation I',
    color: '#FFE6B3',
    starters: [
      { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
      { id: 4, name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
      { id: 7, name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    ],
    total: 151,
    caught: 0,
    start: 1,
    end: 151,
  },
  {
    id: 'johto',
    name: 'JOHTO',
    generation: 'Generation II',
    color: '#FFC9E5',
    starters: [
      { id: 152, name: 'Chikorita', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png' },
      { id: 155, name: 'Cyndaquil', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png' },
      { id: 158, name: 'Totodile', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png' },
    ],
    total: 100,
    caught: 0,
    start: 152,
    end: 251,
  },
  {
    id: 'hoenn',
    name: 'HOENN',
    generation: 'Generation III',
    color: '#B3E5FC',
    starters: [
      { id: 252, name: 'Treecko', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png' },
      { id: 255, name: 'Torchic', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png' },
      { id: 258, name: 'Mudkip', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png' },
    ],
    total: 135,
    caught: 0,
    start: 252,
    end: 386,
  },
  {
    id: 'sinnoh',
    name: 'SINNOH',
    generation: 'Generation IV',
    color: '#E1BEE7',
    starters: [
      { id: 387, name: 'Turtwig', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/387.png' },
      { id: 390, name: 'Chimchar', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/390.png' },
      { id: 393, name: 'Piplup', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/393.png' },
    ],
    total: 107,
    caught: 0,
    start: 387,
    end: 493,
  },
  {
    id: 'unova',
    name: 'UNOVA',
    generation: 'Generation V',
    color: '#C8E6C9',
    starters: [
      { id: 495, name: 'Snivy', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/495.png' },
      { id: 498, name: 'Tepig', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/498.png' },
      { id: 501, name: 'Oshawott', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/501.png' },
    ],
    total: 156,
    caught: 0,
    start: 494,
    end: 649,
  },
  {
    id: 'kalos',
    name: 'KALOS',
    generation: 'Generation VI',
    color: '#FFE0B2',
    starters: [
      { id: 650, name: 'Chespin', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/650.png' },
      { id: 653, name: 'Fennekin', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/653.png' },
      { id: 656, name: 'Froakie', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/656.png' },
    ],
    total: 72,
    caught: 0,
    start: 650,
    end: 721,
  },
  {
    id: 'alola',
    name: 'ALOLA',
    generation: 'Generation VII',
    color: '#FFCCBC',
    starters: [
      { id: 722, name: 'Rowlet', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/722.png' },
      { id: 725, name: 'Litten', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/725.png' },
      { id: 728, name: 'Popplio', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/728.png' },
    ],
    total: 88,
    caught: 0,
    start: 722,
    end: 809,
  },
  {
    id: 'galar',
    name: 'GALAR',
    generation: 'Generation VIII',
    color: '#D1C4E9',
    starters: [
      { id: 810, name: 'Grookey', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/810.png' },
      { id: 813, name: 'Scorbunny', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/813.png' },
      { id: 816, name: 'Sobble', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/816.png' },
    ],
    total: 89,
    caught: 0,
    start: 810,
    end: 898,
  },
];

export function RegionsPage() {
  const navigate = useNavigate();
  const [caughtByRegion, setCaughtByRegion] = useState<Record<string, number>>({});

  useEffect(() => {
    const updateCaughtCounts = () => {
      const captured = readCapturedPokemonFromStorage<CapturedPokemon>();

      // Use unique Pokemon IDs so duplicate captures don't inflate Pokedex progress.
      const uniqueIds = new Set(captured.map((p) => p.id));
      const counts: Record<string, number> = {};

      REGIONS.forEach((region) => {
        let count = 0;
        uniqueIds.forEach((id) => {
          if (id >= region.start && id <= region.end) {
            count += 1;
          }
        });
        counts[region.id] = count;
      });

      setCaughtByRegion(counts);
    };

    updateCaughtCounts();
    window.addEventListener('storage', updateCaughtCounts);
    window.addEventListener('focus', updateCaughtCounts);

    return () => {
      window.removeEventListener('storage', updateCaughtCounts);
      window.removeEventListener('focus', updateCaughtCounts);
    };
  }, []);

  const handleRegionClick = (region: typeof REGIONS[0]) => {
    // Navigate to Pokedex with region filter
    navigate(`/?region=${region.id}&start=${region.start}&end=${region.end}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Regions List */}
      <div className="px-4 pt-3 space-y-3">
        {REGIONS.map((region, index) => (
          <motion.button
            key={region.id}
            onClick={() => handleRegionClick(region)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            style={{ backgroundColor: region.color }}
            className="w-full p-5 rounded-2xl shadow-md text-left relative overflow-hidden"
          >
            {/* Region Info */}
            <div className="relative z-10 pr-44">
              <h3 className="text-2xl font-black text-gray-900 mb-1">
                {region.name}
              </h3>
              <p className="text-sm text-gray-700 font-medium mb-2">
                {region.generation}
              </p>
              <p className="text-xs text-gray-600 font-bold">
                Caught: {caughtByRegion[region.id] ?? region.caught}/{region.total}
              </p>
            </div>

            {/* Starter Pokemon Circles */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
              {region.starters.map((starter) => (
                <div
                  key={starter.id}
                  className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border-2 border-white/60"
                >
                  <img
                    src={starter.image}
                    alt={starter.name}
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}