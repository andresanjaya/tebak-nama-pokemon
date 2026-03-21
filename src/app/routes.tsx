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
    path: '/',
    element: <LayoutWrapper><PokedexPage /></LayoutWrapper>,
  },
  {
    path: '/pokemon/:id',
    element: <LayoutWrapper showHeader={false}><DetailPage /></LayoutWrapper>,
  },
  {
    path: '/regions',
    element: <LayoutWrapper><RegionsPage /></LayoutWrapper>,
  },
  {
    path: '/favorites',
    element: <LayoutWrapper><FavoritesPage /></LayoutWrapper>,
  },
  {
    path: '/game',
    element: <LayoutWrapper showHeader={false}><GameMenuPage /></LayoutWrapper>,
  },
  {
    path: '/game/guess',
    element: <LayoutWrapper showHeader={false}><GamePage /></LayoutWrapper>,
  },
  {
    path: '/game/guess/results',
    element: <LayoutWrapper showHeader={false}><ResultPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle',
    element: <LayoutWrapper showHeader={false}><BattleModeSelectPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/select-pokemon',
    element: <LayoutWrapper showHeader={false}><PokemonSelectionPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/encounter',
    element: <LayoutWrapper showHeader={false}><EnemyEncounterPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/first-attack',
    element: <LayoutWrapper showHeader={false}><FirstAttackChancePage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/fight',
    element: <LayoutWrapper showHeader={false}><BattleFightPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/capture',
    element: <LayoutWrapper showHeader={false}><CapturePage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/result',
    element: <LayoutWrapper showHeader={false}><BattleResultPage /></LayoutWrapper>,
  },
  {
    path: '/game/battle/collection',
    element: <LayoutWrapper showHeader={false}><CollectionPage /></LayoutWrapper>,
  },
  {
    path: '*',
    element: <LayoutWrapper><NotFoundPage /></LayoutWrapper>,
  },
], {
  basename: getRouterBasename(),
});