import { Pokemon, PokemonType, Weakness, Evolution } from '../types/pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const SPRITES_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const TOTAL_POKEMON = 898; // All Pokemon up to Gen 8

// Helper to get animated sprite URL
const getAnimatedSpriteUrl = (id: number): string => {
  return `${SPRITES_BASE_URL}/versions/generation-v/black-white/animated/${id}.gif`;
};

// Fallback to static sprite if animated not available
const getStaticSpriteUrl = (id: number): string => {
  return `${SPRITES_BASE_URL}/${id}.png`;
};

// Get best available sprite (animated if possible)
const getPokemonSpriteUrl = (id: number): string => {
  // For Generation 1 Pokemon (1-151), animated sprites are available
  if (id <= 649) { // Gen V animated sprites go up to Gen 5
    return getAnimatedSpriteUrl(id);
  }
  return getStaticSpriteUrl(id);
};

interface PokeAPIType {
  type: {
    name: string;
  };
}

interface PokeAPIStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokeAPIAbility {
  ability: {
    name: string;
  };
}

interface PokeAPISpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
  is_legendary: boolean;
  is_mythical: boolean;
}

interface PokeAPIResponse {
  id: number;
  name: string;
  types: PokeAPIType[];
  stats: PokeAPIStat[];
  abilities: PokeAPIAbility[];
  weight: number;
  height: number;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  species: {
    url: string;
  };
}

interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
}

interface PokeAPIEvolutionChain {
  chain: EvolutionChain;
}

// Type effectiveness chart (simplified for common weaknesses)
const typeWeaknesses: Record<PokemonType, PokemonType[]> = {
  fire: ['water', 'ground', 'rock'],
  water: ['electric', 'grass'],
  grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
  electric: ['ground'],
  psychic: ['bug', 'ghost', 'dark'],
  ice: ['fire', 'fighting', 'rock', 'steel'],
  dragon: ['ice', 'dragon', 'fairy'],
  dark: ['fighting', 'bug', 'fairy'],
  fairy: ['poison', 'steel'],
  normal: ['fighting'],
  fighting: ['flying', 'psychic', 'fairy'],
  flying: ['electric', 'ice', 'rock'],
  poison: ['ground', 'psychic'],
  ground: ['water', 'grass', 'ice'],
  rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
  bug: ['fire', 'flying', 'rock'],
  ghost: ['ghost', 'dark'],
  steel: ['fire', 'fighting', 'ground'],
};

// Map PokeAPI types to our app's types
const mapPokemonType = (type: string): PokemonType => {
  const typeMap: Record<string, PokemonType> = {
    fire: 'fire',
    water: 'water',
    grass: 'grass',
    electric: 'electric',
    psychic: 'psychic',
    ice: 'ice',
    dragon: 'dragon',
    dark: 'dark',
    fairy: 'fairy',
    normal: 'normal',
    fighting: 'fighting',
    flying: 'flying',
    poison: 'poison',
    ground: 'ground',
    rock: 'rock',
    bug: 'bug',
    ghost: 'ghost',
    steel: 'steel',
  };
  return typeMap[type] || 'normal';
};

// Capitalize first letter
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format ability name
const formatAbilityName = (name: string): string => {
  return name.split('-').map(capitalize).join(' ');
};

// Get Pokemon ID from species URL
const getIdFromUrl = (url: string): number => {
  const parts = url.split('/');
  return parseInt(parts[parts.length - 2]);
};

// Get weaknesses for a Pokemon's types
const getWeaknesses = (types: PokemonType[]): Weakness[] => {
  const weaknessMap = new Map<PokemonType, number>();
  
  types.forEach(type => {
    const weakTo = typeWeaknesses[type] || [];
    weakTo.forEach(weakType => {
      const current = weaknessMap.get(weakType) || 1;
      weaknessMap.set(weakType, current * 2);
    });
  });
  
  // Convert to array and sort by multiplier
  return Array.from(weaknessMap.entries())
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, 4); // Top 4 weaknesses
};

// Get evolution info from evolution chain
const getEvolutionInfo = async (
  chain: EvolutionChain,
  currentName: string
): Promise<{ prev?: Evolution; next?: Evolution } | undefined> => {
  const evolution: { prev?: Evolution; next?: Evolution } = {};
  
  const findInChain = async (
    node: EvolutionChain,
    parent?: EvolutionChain
  ): Promise<boolean> => {
    if (node.species.name === currentName) {
      // Get previous evolution
      if (parent) {
        const prevId = getIdFromUrl(parent.species.url);
        evolution.prev = {
          id: prevId,
          name: capitalize(parent.species.name),
          image: getPokemonSpriteUrl(prevId),
        };
      }
      
      // Get next evolution
      if (node.evolves_to.length > 0) {
        const nextSpecies = node.evolves_to[0].species;
        const nextId = getIdFromUrl(nextSpecies.url);
        evolution.next = {
          id: nextId,
          name: capitalize(nextSpecies.name),
          image: getPokemonSpriteUrl(nextId),
        };
      }
      return true;
    }
    
    for (const nextNode of node.evolves_to) {
      if (await findInChain(nextNode, node)) {
        return true;
      }
    }
    
    return false;
  };
  
  await findInChain(chain);
  return evolution.prev || evolution.next ? evolution : undefined;
};

// Helper function to fetch with retry
const fetchWithRetry = async (
  url: string,
  retries: number = 3,
  delay: number = 1000
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      // If not ok but not a network error, don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Failed after retries');
};

// Fetch a single Pokemon by ID
export const fetchPokemonById = async (id: number): Promise<Pokemon> => {
  try {
    // Fetch basic Pokemon data
    const response = await fetchWithRetry(`${POKEAPI_BASE_URL}/pokemon/${id}`);
    const data: PokeAPIResponse = await response.json();
    
    // Fetch species data for description and evolution chain
    const speciesResponse = await fetchWithRetry(data.species.url);
    const speciesData: PokeAPISpecies = await speciesResponse.json();
    
    // Get English description
    const englishEntry = speciesData.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    const description = englishEntry
      ? englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
      : 'A mysterious Pokemon.';
    
    // Fetch evolution chain
    let evolution: { prev?: Evolution; next?: Evolution } | undefined = undefined;
    try {
      const evolutionResponse = await fetchWithRetry(speciesData.evolution_chain.url);
      const evolutionData: PokeAPIEvolutionChain = await evolutionResponse.json();
      const evolutionInfo = await getEvolutionInfo(evolutionData.chain, data.name);
      if (evolutionInfo) {
        evolution = evolutionInfo;
      }
    } catch (error) {
      console.warn(`Failed to fetch evolution chain for ${data.name}:`, error);
    }
    
    // Map to our Pokemon interface
    const pokemon: Pokemon = {
      id: data.id,
      name: capitalize(data.name),
      types: data.types.map(t => mapPokemonType(t.type.name)),
      stats: {
        hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
        attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
        defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
        specialAttack: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
        specialDefense: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
        speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
      },
      abilities: data.abilities.slice(0, 2).map(a => formatAbilityName(a.ability.name)),
      description,
      image: getPokemonSpriteUrl(data.id),
      isLegendary: speciesData.is_legendary || speciesData.is_mythical,
      evolution,
      weight: data.weight,
      height: data.height,
      weaknesses: getWeaknesses(data.types.map(t => mapPokemonType(t.type.name))),
    };
    
    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    throw error;
  }
};

// Fetch multiple Pokemon with pagination support
export const fetchPokemonList = async (
  limit: number = 200, 
  page: number = 1
): Promise<Pokemon[]> => {
  try {
    const results: Pokemon[] = [];
    const batchSize = 50; // Load 50 at a time to avoid rate limiting
    
    // Calculate start and end IDs based on page
    const startId = (page - 1) * limit + 1;
    const endId = Math.min(startId + limit - 1, TOTAL_POKEMON);
    
    // Load in batches
    for (let start = startId; start <= endId; start += batchSize) {
      const end = Math.min(start + batchSize - 1, endId);
      const batchPromises = [];
      
      for (let i = start; i <= end; i++) {
        batchPromises.push(
          fetchPokemonById(i).catch(err => {
            console.warn(`Skipping Pokemon ${i}:`, err.message);
            return null; // Return null for failed fetches
          })
        );
      }
      
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out null values (failed fetches)
      const validResults = batchResults.filter((p): p is Pokemon => p !== null);
      results.push(...validResults);
      
      // Add small delay between batches to avoid rate limiting
      if (end < endId) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
};

// Fetch random Pokemon for quiz
export const fetchRandomPokemon = async (count: number): Promise<Pokemon[]> => {
  const ids = new Set<number>();
  
  // Generate unique random IDs
  while (ids.size < count) {
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    ids.add(randomId);
  }
  
  const promises = Array.from(ids).map(id => fetchPokemonById(id));
  return Promise.all(promises);
};

// Calculate Pokemon rarity (1-6 stars) based on total stats
export const calculatePokemonRarity = (pokemon: Pokemon): number => {
  // Calculate total base stats (BST - Base Stat Total)
  const totalStats = 
    (pokemon.stats.hp || 0) + 
    (pokemon.stats.attack || 0) + 
    (pokemon.stats.defense || 0) + 
    (pokemon.stats.specialAttack || 0) + 
    (pokemon.stats.specialDefense || 0) + 
    (pokemon.stats.speed || 0);
  
  // Legendary/Mythical Pokemon always get 6 stars
  if (pokemon.isLegendary) return 6;
  
  // Rarity tiers based on total stats (BST - Base Stat Total)
  // Reference:
  // - Legendary Pokemon: 580-720 BST (auto 6★)
  // - Pseudo-legendary: 600 BST
  // - Strong Pokemon: 500-579 BST
  // - Above Average: 450-499 BST
  // - Average: 400-449 BST
  // - Below Average: 300-399 BST
  
  if (totalStats >= 600) return 6; // 6★ - Legendary tier stats
  if (totalStats >= 540) return 5; // 5★ - Pseudo-legendary (Dragonite, Tyranitar, Garchomp)
  if (totalStats >= 500) return 4; // 4★ - Strong (Arcanine, Gyarados, Starters final evo)
  if (totalStats >= 450) return 3; // 3★ - Above Average (Most evolved Pokemon)
  if (totalStats >= 400) return 2; // 2★ - Average (Mid-stage evolutions)
  return 1; // 1★ - Below Average (Basic Pokemon)
};