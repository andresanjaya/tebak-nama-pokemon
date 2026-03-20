import { useState, useEffect } from 'react';
import { Pokemon } from '../types/pokemon';
import { fetchPokemonList, fetchPokemonById } from '../services/pokeapi';

export const usePokemonList = () => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const POKEMON_PER_PAGE = 200;
  const TOTAL_POKEMON = 898;

  // Initial load
  useEffect(() => {
    const loadInitialPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPokemonList(POKEMON_PER_PAGE, 1);
        setPokemon(data);
        setCurrentPage(1);
        setHasMore(data.length >= POKEMON_PER_PAGE);
      } catch (err) {
        setError('Failed to load Pokemon data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPokemon();
  }, []);

  // Load more function
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const startId = (nextPage - 1) * POKEMON_PER_PAGE + 1;
      
      // Check if we've reached the end
      if (startId > TOTAL_POKEMON) {
        setHasMore(false);
        return;
      }

      const data = await fetchPokemonList(POKEMON_PER_PAGE, nextPage);
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPokemon(prev => [...prev, ...data]);
        setCurrentPage(nextPage);
        setHasMore(startId + POKEMON_PER_PAGE <= TOTAL_POKEMON);
      }
    } catch (err) {
      console.error('Failed to load more Pokemon:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { pokemon, loading, loadingMore, error, hasMore, loadMore };
};

export const usePokemonById = (id: number) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPokemonById(id);
        setPokemon(data);
      } catch (err) {
        setError('Failed to load Pokemon. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPokemon();
    }
  }, [id]);

  return { pokemon, loading, error };
};