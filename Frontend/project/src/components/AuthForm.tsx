import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plane, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { supabase, sendUserToBackend } from '../lib/supabase';

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.search.includes('mode=login'));
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  useEffect(() => {
    setIsLogin(location.search.includes('mode=login'));
  }, [location]);

  // 🔹 Handle Email Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials = { email, password };

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          ...credentials,
          options: { persistSession: rememberMe },
        });
        if (error) throw error;

        await sendUserToBackend();

        // Get user ID (if needed for debug)
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User ID:', user?.id);

        toast.success('Welcome back to ZippyTrip!');
        navigate('/home');
      } else {
        // Signup flow
        const { error } = await supabase.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
          },
        });

        if (error?.message.includes('confirmation')) {
          toast.success('Check your email to confirm your account before logging in.');
        } else if (error) {
          throw error;
        } else {
          await sendUserToBackend();
          toast.success('Welcome to ZippyTrip! Your account has been created.');
          navigate('/Preferences');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error('Please enter your email.');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=login`,
      });

      if (error) throw error;

      toast.success('Password reset link sent! Check your email.');
      setIsResetPassword(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/home` },
      });

      if (error) throw error;

      await sendUserToBackend();
      navigate('/home');
    } catch (error: any) {
      toast.error('Google login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2031&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-black bg-opacity-75 rounded-2xl shadow-xl w-full max-w-md p-8">
          {isResetPassword && (
            <button
              onClick={() => setIsResetPassword(false)}
              className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </button>
          )}

          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-500 bg-opacity-20 rounded-full mb-4">
              <Plane className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              {isResetPassword
                ? 'Reset Password'
                : isLogin
                ? 'Welcome to ZippyTrip'
                : 'Join ZippyTrip'}
            </h2>
            <p className="text-gray-400 mt-2">
              {isResetPassword
                ? 'Enter your email to receive reset instructions'
                : isLogin
                ? 'Sign in to continue your journey'
                : 'Create an account to start your adventure'}
            </p>
          </div>

          <form
            onSubmit={isResetPassword ? handlePasswordReset : handleAuth}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}

            {isLogin && !isResetPassword && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-500"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isResetPassword ? (
                'Send Reset Instructions'
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {!isResetPassword && (
            <div className="mt-6 text-center">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="text-sm text-white underline hover:text-blue-400"
              >
                {loading ? 'Processing...' : 'Continue with Google'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}