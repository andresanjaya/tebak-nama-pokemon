import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

const POKEMON_WALLPAPER_URL = '/pokemon-wallpaper.jpg';
const POKEMON_LOGO_URL = '/International_Pokémon_logo.svg';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        await register(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between relative overflow-hidden"
      style={{
        backgroundImage: `url(${POKEMON_WALLPAPER_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.50) 50%, #F9F9F9 100%)',
        }}
      />

      {/* Header - Logo and Title */}
      <div className="w-full text-center pt-8 relative z-10">
        <div className="mb-4 flex justify-center">
          <img src={POKEMON_LOGO_URL} alt="Pokemon Logo" className="h-20 w-auto drop-shadow-lg" />
        </div>
        
      </div>

      {/* White Bottom Sheet Card */}
      <div 
        style={{
          display: 'flex',
          width: '100%',
          maxWidth: '448px',
          padding: '32px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '32px',
          borderRadius: '48px 48px 0 0',
          background: '#FFFFFF',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
          minHeight: '70vh',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 10,
          overflowY: 'auto',
        }}
      >
        {/* Welcome Text */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 mb-2">
            {isLogin ? 'Sign in to continue your journey' : 'Join the adventure and build your collection!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="w-full space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-3 tracking-wide">
              {isLogin ? 'USERNAME OR EMAIL' : 'EMAIL'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">@</span>
              <Input
                type="email"
                placeholder="ash.ketchum@kanto.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-gray-700 tracking-wide">PASSWORD</label>
              {isLogin && (
                <button type="button" onClick={() => {}} className="text-xs font-bold text-red-600 hover:text-red-700">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔒</span>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 pr-12 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-3 tracking-wide">CONFIRM PASSWORD</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔒</span>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-12 pr-12 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl text-lg mt-8"
          >
            {isLoading ? 'Loading...' : isLogin ? 'Login →' : 'Create Account'}
          </Button>
        </form>

        {/* Register/Login Toggle Button */}
        <Button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
          variant="outline"
          className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-3 rounded-2xl text-lg"
        >
          {isLogin ? 'Register' : 'Login'}
        </Button>

        {/* Divider */}
        <div className="flex items-center w-full gap-4">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Continue as Guest */}
        <div className="text-center w-full">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-semibold inline-flex items-center gap-2"
          >
            Continue as Guest
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">NEW</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm w-full">© 2024 POKEMON NEXACATCH</div>
      </div>
    </div>
  );
}
