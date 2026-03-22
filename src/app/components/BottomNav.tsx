import { Gamepad2, Heart, Map, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { PokeballIcon } from './PokeballIcon';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/pokemon/');
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: 'pokeball', label: 'Pokédex' },
    { path: '/regions', icon: Map, label: 'Regions' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/game', icon: Gamepad2, label: 'Games' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Pokedex red bottom bar */}
      <div className="bg-[#DC2626] border-t-4 border-gray-950 shadow-2xl">
        <div className="flex justify-around items-center px-6 py-3 max-w-md mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  {/* White rounded button */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-white shadow-lg'
                        : 'bg-red-700/50 hover:bg-red-700/70'
                    }`}
                  >
                    {item.icon === 'pokeball' ? (
                      <PokeballIcon 
                        size={20}
                        className={active ? 'text-[#DC2626]' : 'text-white/70'}
                      />
                    ) : (
                      (() => {
                        const Icon = item.icon as any;
                        return (
                          <Icon 
                            className={`w-5 h-5 ${
                              active ? 'text-[#DC2626]' : 'text-white/70'
                            } ${active && item.label === 'Favorites' ? 'fill-current' : ''}`}
                          />
                        );
                      })()
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className={`text-[8px] font-bold tracking-wider ${
                      active ? 'text-white' : 'text-white/60'
                    }`}
                  >
                    {item.label.toUpperCase()}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* Profile button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center justify-center flex-1"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isActive('/profile')
                    ? 'bg-white shadow-lg'
                    : 'bg-red-700/50 hover:bg-red-700/70'
                }`}
              >
                <User
                  className={`w-5 h-5 ${
                    isActive('/profile') ? 'text-[#DC2626]' : 'text-white/70'
                  }`}
                />
              </div>
              <span
                className={`text-[8px] font-bold tracking-wider ${
                  isActive('/profile') ? 'text-white' : 'text-white/60'
                }`}
              >
                PROFILE
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}