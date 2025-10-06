import { supabase } from '../../../utils/supabase/client';
import { TABLES } from '../../../config/database';
import { AUTH_ERRORS } from '../constants';
export class AuthService {
    /**
     * Authenticate user with email and password
     */
    static async login(credentials) {
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
        // Step 4: Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from(TABLES.USER_PROFILES)
            .select('*')
            .eq('id', authData.user.id)
            .single();
        if (profileError) {
            throw new Error('Failed to load user profile. Please try again.');
        }
        return profile;
    }
    /**
     * Register new user with invite code
     */
    static async signup(signupData) {
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
    static async loadInvite(inviteCode) {
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
    static async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(AUTH_ERRORS.LOGOUT_FAILED);
        }
    }
    /**
     * Reset password for user
     */
    static async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
            throw new Error('Failed to send reset email');
        }
    }
    /**
     * Get current user from session
     */
    static async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return null;
        }
        const { data: profile, error } = await supabase
            .from(TABLES.USER_PROFILES)
            .select('*')
            .eq('id', session.user.id)
            .single();
        if (error || !profile) {
            return null;
        }
        return profile;
    }
    /**
     * Store user data in localStorage
     */
    static storeUserData(user) {
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
    static getUserData() {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Clear user data from localStorage
     */
    static clearUserData() {
        localStorage.removeItem('user');
    }
}
