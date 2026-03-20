import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { PokedexHeader } from './PokedexHeader';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pokedex Header */}
      {showHeader && <PokedexHeader />}
      
      {/* Main content with minimal padding */}
      <div className="max-w-md mx-auto pb-24">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}