# Pokémon Pokédex - API Integration

## Data Source
This application now uses real Pokémon data from [PokéAPI](https://pokeapi.co/), a free and open RESTful API for Pokémon information.

## Features
- **Real Pokémon Data**: Fetches data for the first 151 Pokémon (Generation 1)
- **Official Artwork**: Uses high-quality official artwork for each Pokémon
- **Complete Stats**: Includes HP, Attack, Defense, and Speed stats
- **Abilities**: Shows up to 2 abilities per Pokémon
- **Evolution Chains**: Displays evolution information where available
- **Descriptions**: Includes Pokédex descriptions in English

## API Service
Located in `/src/app/services/pokeapi.ts`

### Key Functions:
- `fetchPokemonById(id)`: Fetches a single Pokémon by ID
- `fetchPokemonList(limit)`: Fetches multiple Pokémon (default: 151)
- `fetchRandomPokemon(count)`: Fetches random Pokémon for quiz game

## Custom Hooks
Located in `/src/app/hooks/usePokemon.ts`

### Available Hooks:
- `usePokemonList()`: Loads all Pokémon with loading and error states
- `usePokemonById(id)`: Loads a specific Pokémon by ID

## Data Flow
1. **Pokédex Page**: Uses `usePokemonList()` to load all 151 Pokémon on mount
2. **Detail Page**: Uses `usePokemonById()` to load specific Pokémon when viewing details
3. **Game Page**: Uses `fetchRandomPokemon()` to generate quiz questions with random Pokémon

## API Rate Limiting
PokéAPI is free and doesn't require authentication, but please be mindful of rate limits:
- Fair use: No specific rate limit, but avoid hammering the API
- The app caches data in component state to minimize API calls
- Quiz game fetches 40 Pokémon at once for 10 questions

## Error Handling
All API calls include proper error handling:
- Loading states with spinners
- Error messages with retry options
- Fallback navigation if data fails to load

## Credits
Pokémon data provided by [PokéAPI](https://pokeapi.co/)
