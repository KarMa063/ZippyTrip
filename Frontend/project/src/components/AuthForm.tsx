import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plane, Lock, Mail, Phone, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.search.includes('mode=login'));
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setIsLogin(location.search.includes('mode=login'));
  }, [location]);

  // 🔹 Handle Email/Phone Authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const credentials = loginMethod === 'email' 
        ? { email, password }
        : { phone, password };

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        toast.success('Welcome back to ZippyTrip!');
        navigate('/home');
      } else {
        // Signup Flow
        const { error } = await supabase.auth.signUp({
          ...credentials,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { email_confirm: false }
          }
        });
        if (error) throw error;
        
        // Auto-login after signup
        const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
        if (signInError) throw signInError;

        toast.success('Welcome to ZippyTrip! Your account has been created.');
        navigate('/home');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      toast.error('Google login failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2031&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-black bg-opacity-75 rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-500 bg-opacity-20 rounded-full mb-4">
              <Plane className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? 'Welcome to ZippyTrip' : 'Join ZippyTrip'}
            </h2>
            <p className="text-gray-400 mt-2">
              {isLogin
                ? 'Sign in to continue your journey'
                : 'Create an account to start your adventure'}
            </p>
          </div>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                loginMethod === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                loginMethod === 'phone'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {loginMethod === 'email' ? (
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
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>
            )}

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
                  className="pl-10 w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Sign In' : 'Sign Up'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition duration-200 mt-4"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
