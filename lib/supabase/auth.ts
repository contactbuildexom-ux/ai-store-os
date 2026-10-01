import { supabase } from './client';

// 1. User Sign Up
export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// 2. User Sign In (Login)
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// 3. User Sign Out
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// 4. Get Current Active User Session
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}