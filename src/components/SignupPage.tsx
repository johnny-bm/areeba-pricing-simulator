import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { TABLES } from '../config/database';
import WordMarkRed from '../imports/WordMarkRed';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlInviteCode = searchParams.get('invite');

  const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
  const [invite, setInvite] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Auto-load invite if code in URL
  useEffect(() => {
    if (urlInviteCode) {
      loadInvite(urlInviteCode);
    }
  }, [urlInviteCode]);

  const loadInvite = async (code: string) => {
    setLoadingInvite(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('user_invites')
        .select('*')
        .eq('invite_code', code)
        .is('used_at', null)
        .single();

      if (error || !data) {
        setError('Invite code not found or already used');
        setLoadingInvite(false);
        return;
      }

      // Check if expired
      if (new Date((data as any).expires_at) < new Date()) {
        setError('This invite has expired. Please request a new one');
        setLoadingInvite(false);
        return;
      }

      setInvite(data);
      setFirstName((data as any).first_name || '');
      setLastName((data as any).last_name || '');
      setShowForm(true);
      setError('');
    } catch (err) {
      setError('Failed to load invite details');
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleLoadInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    loadInvite(inviteCode.trim());
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Step 1: Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!authData.user) {
        throw new Error('Signup failed - no user returned');
      }

      console.log('Step 2: Auth user created:', authData.user.id);
      console.log('Step 3: Creating profile with data:', {
        id: authData.user.id,
        email: invite.email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: invite.role,
        is_active: true,
      });

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
        .select();

      console.log('Profile insert result:', { profileData, profileError });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Step 4: Marking invite as used...');
      await supabase
        .from('user_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      console.log('Step 5: Success! Navigating to simulators...');
      navigate('/simulators');
    } catch (err: any) {
      console.error('Full signup error:', err);
      setError(err.message || 'Signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="w-24 h-6 mx-auto mb-4">
              <WordMarkRed />
            </div>
            <CardTitle className="text-center">Enter Invite Code</CardTitle>
            <CardDescription className="text-center">
              Enter the invite code provided by your administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoadInvite} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your invite code"
                  disabled={loadingInvite}
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loadingInvite}
              >
                {loadingInvite ? 'Loading...' : 'Continue'}
              </Button>

              <Button
                type="button"
                onClick={() => navigate('/login')}
                variant="ghost"
                className="w-full"
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="w-24 h-6 mx-auto mb-4">
            <WordMarkRed />
          </div>
          <CardTitle className="text-center">Complete Your Account</CardTitle>
          <CardDescription className="text-center">
            You've been invited as {invite?.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={invite?.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
