import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-8xl mb-4">❓</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6">This page doesn't exist in the Pokédex!</p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all mx-auto"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
