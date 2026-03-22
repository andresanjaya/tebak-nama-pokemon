import { createClient } from '@supabase/supabase-js';

const projectId = 'wcjenjebetvwkxnptvib';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjamVuamViZXR2d2t4bnB0dmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Njc0NDIsImV4cCI6MjA4OTU0MzQ0Mn0.UJxzI3OUVAJY-SxMU7QQ-DVySFd2fwRj1xqDUlMJIYM';
const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

// Auth functions
export const authService = {
  // Register user
  async register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Login user
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
};

// Player progress functions
export const playerProgressService = {
  // Save or update player progress
  async savePlayerProgress(userId: string, level: number, xp: number) {
    const { data, error } = await supabase
      .from('player_progress')
      .upsert({
        user_id: userId,
        level,
        xp,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });
    if (error) throw error;
    return data;
  },

  // Get player progress
  async getPlayerProgress(userId: string) {
    const { data, error } = await supabase
      .from('player_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  },
};

// Captured Pokemon functions
export const capturedPokemonService = {
  // Save or update captured pokemon
  async saveCapturedPokemon(userId: string, pokemonData: any) {
    const { data, error } = await supabase
      .from('captured_pokemon')
      .upsert({
        user_id: userId,
        ...pokemonData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,captured_id',
      });
    if (error) throw error;
    return data;
  },

  // Get all captured pokemon for user
  async getCapturedPokemon(userId: string) {
    const { data, error } = await supabase
      .from('captured_pokemon')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  // Get single captured pokemon
  async getSingleCapturedPokemon(userId: string, capturedId: string) {
    const { data, error } = await supabase
      .from('captured_pokemon')
      .select('*')
      .eq('user_id', userId)
      .eq('captured_id', capturedId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Delete captured pokemon
  async deleteCapturedPokemon(userId: string, capturedId: string) {
    const { error } = await supabase
      .from('captured_pokemon')
      .delete()
      .eq('user_id', userId)
      .eq('captured_id', capturedId);
    if (error) throw error;
  },
};
