import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Cache admin status in memory for instant access across components
const adminCache = new Map<string, boolean>();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    // Check cache first for instant response
    if (adminCache.has(userId)) {
      return adminCache.get(userId)!;
    }
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    const isAdminUser = !!data;
    adminCache.set(userId, isAdminUser);
    return isAdminUser;
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get initial session immediately - don't wait for listener
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check admin status (will be cached for subsequent calls)
        const adminStatus = await checkAdminStatus(session.user.id);
        if (mounted) setIsAdmin(adminStatus);
      }
      
      // Set loading false IMMEDIATELY after getting session
      if (mounted) setLoading(false);
    });

    // Set up auth state listener for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id);
          if (mounted) setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
          adminCache.clear();
        }
        
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: 'Welcome to our jewellery collection.',
      });

      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Account created failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const adminStatus = await checkAdminStatus(data.user.id);
      setIsAdmin(adminStatus);

      toast({
        title: adminStatus ? 'Welcome Admin!' : 'Welcome back!',
        description: adminStatus ? 'Redirecting to dashboard...' : 'You have been signed in successfully.',
      });

      return { ...data, isAdmin: adminStatus };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Sign in failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [checkAdminStatus, toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAdmin(false);
      adminCache.clear();
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });

      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Sign out failed',
        description: message,
        variant: 'destructive',
      });
    }
  }, [navigate, toast]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }), [user, session, loading, isAdmin, signUp, signIn, signOut]);
}
