import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  User, Mail, Lock, Globe, Moon, Sun, 
  ChevronLeft, Languages, CreditCard, 
  Shield, Bell, BellRing, Eye, EyeOff, Camera 
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'en',
    currency: 'NPR',
    theme: 'light',
    notificationsEnabled: true,
    emailNotifications: true,
    avatarFile: null as File | null,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.id);

      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no profile exists, create one with default values
      if (!profile) {
        const defaultProfile = {
          id: user.id,
          full_name: '',
          email: user.email,
          language: 'en',
          currency: 'NPR',
          theme: 'light',
          notifications_enabled: true,
          email_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) throw createError;

        setFormData(prev => ({
          ...prev,
          fullName: '',
          email: user.email || '',
          language: 'en',
          currency: 'NPR',
          theme: 'light',
          notificationsEnabled: true,
          emailNotifications: true,
        }));
      } else {
        // Use existing profile data
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: user.email || '',
          language: profile.language || 'en',
          currency: profile.currency || 'NPR',
          theme: profile.theme || 'light',
          notificationsEnabled: profile.notifications_enabled ?? true,
          emailNotifications: profile.email_notifications ?? true,
        }));
        if (profile.avatar_url) {
          setProfileUrl(profile.avatar_url);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async () => {
    if (!formData.avatarFile || !userId) return null;

    const fileExt = formData.avatarFile.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData.avatarFile, { upsert: true });

    if (uploadError) {
      toast.error('Error uploading image');
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatarUrl = profileUrl;
      if (formData.avatarFile) {
        avatarUrl = await uploadPhoto();
        setProfileUrl(avatarUrl);
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        const { error: passError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passError) throw passError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          language: formData.language,
          theme: formData.theme,
          currency: formData.currency,
          notifications_enabled: formData.notificationsEnabled,
          email_notifications: formData.emailNotifications,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Settings updated successfully');
      loadUserProfile();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile */}
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" /> Profile
            </h2>

            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20">
                <img
                  src={profileUrl || '/placeholder.png'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-4 w-4 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })
                  }
                />
              </div>
              <div>
                <p className="text-lg font-semibold">{formData.fullName}</p>
                <p className="text-sm text-gray-400">{formData.email}</p>
              </div>
            </div>

            <label className="block text-sm text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
              required
              aria-label="Full Name"
            />
          </section>

          {/* Password */}
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" /> Security
            </h2>

            <label className="block text-sm text-gray-300 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                aria-label="Toggle current password visibility"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <label className="block mt-4 text-sm text-gray-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <label className="block mt-4 text-sm text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
            />
          </section>

          {/* Preferences */}
          <section className="bg-gray-800 rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" /> Preferences
            </h2>

            {/* Language */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
              >
                <option value="en">English</option>
                <option value="ne">Nepali</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5"
              >
                <option value="NPR">Nepalese Rupee (NPR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="INR">Indian Rupee (INR)</option>
              </select>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-300" htmlFor="darkModeToggle">
                <Moon className="h-5 w-5 mr-2" /> Dark Mode
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.theme === 'dark'}
                id="darkModeToggle"
                onClick={() =>
                  setFormData({ ...formData, theme: formData.theme === 'dark' ? 'light' : 'dark' })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  formData.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${
                    formData.theme === 'dark' ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" /> Notifications
            </h2>

            <div className="flex items-center justify-between">
              <label htmlFor="pushToggle" className="flex items-center text-sm text-gray-300">
                <BellRing className="h-5 w-5 mr-2" /> Push Notifications
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.notificationsEnabled}
                id="pushToggle"
                onClick={() =>
                  setFormData({
                    ...formData,
                    notificationsEnabled: !formData.notificationsEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  formData.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${
                    formData.notificationsEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="emailToggle" className="flex items-center text-sm text-gray-300">
                <Mail className="h-5 w-5 mr-2" /> Email Notifications
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.emailNotifications}
                id="emailToggle"
                onClick={() =>
                  setFormData({
                    ...formData,
                    emailNotifications: !formData.emailNotifications,
                  })
                }
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${
                    formData.emailNotifications ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;