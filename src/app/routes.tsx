import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { PokedexPage } from './pages/PokedexPage';
import { DetailPage } from './pages/DetailPage';
import { GamePage } from './pages/GamePage';
import { GameMenuPage } from './pages/GameMenuPage';
import { BattleModeSelectPage } from './pages/BattleModeSelectPage';
import { PokemonSelectionPage } from './pages/PokemonSelectionPage';
import { EnemyEncounterPage } from './pages/EnemyEncounterPage';
import { FirstAttackChancePage } from './pages/FirstAttackChancePage';
import { BattleFightPage } from './pages/BattleFightPage';
import { BattleGamePage } from './pages/BattleGamePage';
import { CapturePage } from './pages/CapturePage';
import { BattleResultPage } from './pages/BattleResultPage';
import { CollectionPage } from './pages/CollectionPage';
import { ResultPage } from './pages/ResultPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RegionsPage } from './pages/RegionsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ReactElement } from 'react';

// Layout wrapper component
function LayoutWrapper({ children, showHeader = true }: { children: ReactElement; showHeader?: boolean }) {
  return <Layout showHeader={showHeader}>{children}</Layout>;
}

function getRouterBasename() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') && baseUrl !== '/'
    ? baseUrl.slice(0, -1)
    : baseUrl;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><LayoutWrapper><PokedexPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/pokemon/:id',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><DetailPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/regions',
    element: <ProtectedRoute><LayoutWrapper><RegionsPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/favorites',
    element: <ProtectedRoute><LayoutWrapper><FavoritesPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><GameMenuPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/guess',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><GamePage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/guess/results',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><ResultPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><BattleModeSelectPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/select-pokemon',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><PokemonSelectionPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/encounter',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><EnemyEncounterPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/first-attack',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><FirstAttackChancePage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/fight',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><BattleFightPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/capture',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><CapturePage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/result',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><BattleResultPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '/game/battle/collection',
    element: <ProtectedRoute><LayoutWrapper showHeader={false}><CollectionPage /></LayoutWrapper></ProtectedRoute>,
  },
  {
    path: '*',
    element: <LayoutWrapper><NotFoundPage /></LayoutWrapper>,
  },
], {
  basename: getRouterBasename(),
});