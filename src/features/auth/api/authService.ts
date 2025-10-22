import { supabase } from '../../../utils/supabase/client';
import { TABLES } from '../../../config/database';
import { User } from '../../../types/domain';
import { LoginCredentials, SignupData, Invite } from '../types';
import { AUTH_ERRORS } from '../constants';

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error(AUTH_ERRORS.LOGIN_FAILED);
    }

    // Step 2: Wait for session to be fully set (ensures RLS policies work)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 3: Verify session is active
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Session setup failed. Please try again.');
    }

    // Step 4: Fetch user profile with fallback
    let profile;
    let profileError;
    
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      profile = data;
      profileError = error;
    } catch (error) {
      // // console.error('Profile fetch error:', error);
      profileError = error;
    }

    // If profile doesn't exist, create one automatically
    if (profileError || !profile) {
      // // console.log('Profile not found, creating one automatically...');
      
      const newProfile = {
        id: authData.user.id,
        email: authData.user.email || '',
        first_name: authData.user.user_metadata?.first_name || '',
        last_name: authData.user.user_metadata?.last_name || '',
        role: 'member',
        is_active: true
      };

      try {
        const { data: createdProfile, error: createError } = await supabase
          .from(TABLES.USER_PROFILES)
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          // // console.error('Failed to create profile:', createError);
          // Use the new profile data as fallback
          profile = newProfile;
        } else {
          profile = createdProfile;
        }
      } catch (createError) {
        // // console.error('Profile creation failed:', createError);
        // Use the new profile data as fallback
        profile = newProfile;
      }
    }

    return profile;
  }

  /**
   * Register new user with invite code
   */
  static async signup(signupData: SignupData): Promise<User> {
    const { email, password, firstName, lastName, inviteCode } = signupData;

    // Step 1: Load and validate invite
    const invite = await this.loadInvite(inviteCode);
    if (!invite) {
      throw new Error('Invalid or expired invite code');
    }

    // Step 2: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password: password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error(AUTH_ERRORS.SIGNUP_FAILED);
    }

    // Step 3: Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from(TABLES.USER_PROFILES)
      .insert({
        id: authData.user.id,
        email: invite.email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: invite.role,
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      throw new Error('Failed to create user profile');
    }

    // Step 4: Mark invite as used
    await supabase
      .from('user_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id);

    return profileData;
  }

  /**
   * Load invite by code
   */
  static async loadInvite(inviteCode: string): Promise<Invite | null> {
    const { data, error } = await supabase
      .from('user_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(AUTH_ERRORS.LOGOUT_FAILED);
    }
  }

  /**
   * Reset password for user
   */
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error('Failed to send reset email');
    }
  }

  /**
   * Get current user from session with timeout handling
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Add timeout to session check
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 3000)
      );
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (!session?.user) {
        return null;
      }

      // Try to get profile with timeout
      let profile;
      let error;
      
      try {
        const profilePromise = supabase
          .from(TABLES.USER_PROFILES)
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const profileTimeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
        );
        
        const { data, error: profileError } = await Promise.race([
          profilePromise,
          profileTimeoutPromise
        ]);
        
        profile = data;
        error = profileError;
      } catch (err) {
        error = err;
      }

      // If profile doesn't exist, create one automatically
      if (error || !profile) {
        const newProfile = {
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: 'member',
          is_active: true
        };

        try {
          const createPromise = supabase
            .from(TABLES.USER_PROFILES)
            .insert(newProfile)
            .select()
            .single();
          
          const createTimeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout')), 2000)
          );
          
          const { data: createdProfile, error: createError } = await Promise.race([
            createPromise,
            createTimeoutPromise
          ]);

          if (createError) {
            // Use the new profile data as fallback
            profile = newProfile;
          } else {
            profile = createdProfile;
          }
        } catch (createError) {
          // Use the new profile data as fallback
          profile = newProfile;
        }
      }

      return profile;
    } catch (error) {
      console.warn('Auth service error:', error);
      return null;
    }
  }

  /**
   * Store user data in localStorage
   */
  static storeUserData(user: User): void {
    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }));
  }

  /**
   * Get user data from localStorage
   */
  static getUserData(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear user data from localStorage
   */
  static clearUserData(): void {
    localStorage.removeItem('user');
  }
}
