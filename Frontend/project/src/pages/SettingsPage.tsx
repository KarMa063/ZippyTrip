import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Bell, Globe, Moon, Sun,
  Shield,
  Plane,  Save, RefreshCw,
  Check, X, Eye, EyeOff, Palette
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stars, setStars] = useState<Array<{id: number, size: number, top: string, left: string, delay: number}>>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: false
  });
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // Generate stars for the interactive background
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 4
    }));
    setStars(newStars);
  }, []);

  // 3D parallax effect on mouse move
  useEffect(() => {
    const settings = settingsRef.current;
    if (!settings) return;
    
    // Disable parallax effect by commenting out or removing this code
    /*
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const moveX = (clientX - innerWidth / 2) / 50;
      const moveY = (clientY - innerHeight / 2) / 50;
      
      settings.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
    */
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setFormData({
            ...formData,
            email: user.email || '',
            fullName: user.user_metadata?.full_name || '',
            phone: user.user_metadata?.phone || '',
            bio: user.user_metadata?.bio || '',
            profileImage: user.user_metadata?.avatar_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  // Handle file upload for profile image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    setLoading(true);
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // Update the form data with the new image URL
      setFormData({
        ...formData,
        profileImage: data.publicUrl
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: formData.profileImage
        }
      });
      
      if (error) throw error;
      
      // Apply theme color to CSS variables
      document.documentElement.style.setProperty('--primary-color', themeColor);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error updating user:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Update the handleThemeChange function
  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
    // Apply the theme change to the entire app
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
  };

  const handleColorChange = (color: string) => {
    setThemeColor(color);
    // Real-time preview
    document.documentElement.style.setProperty('--primary-color-preview', color);
  };

  //const handleLogout = async () => {
    //await supabase.auth.signOut();
    //navigate('/');
  //};

  return (
    <div className={`settings-page relative min-h-screen overflow-hidden ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Dark overlay - only show in dark mode */}
      {isDarkMode && <div className="absolute inset-0 bg-black bg-opacity-75"></div>}

      {/* Interactive star background */}
      <div className="interactive-bg">
        {stars.map(star => (
          <div 
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Diamond outline animation */}
      <div className="diamond-outline"></div>
      <div className="diamond-outline diamond-outline-delayed"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="logo-container">
              <Plane className="h-8 w-8 text-blue-500 plane-animation" />
            </div>
            <span className="ml-2 text-2xl font-bold text-white animated-text">
              ZippyTrip
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="diamond-button-outline"
            >
              <span className="diamond-button-content">Home</span>
            </button>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl mx-auto settings-container" ref={settingsRef}>
            <h1 className="text-4xl font-bold text-white mb-8 text-center text-glow">Account Settings</h1>
            
            {/* Settings Tabs */}
            <div className="settings-tabs mb-8">
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-5 h-5 mr-2" />
                Profile
              </button>
              <button 
                className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </button>
              <button 
                className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <Globe className="w-5 h-5 mr-2" />
                Preferences
              </button>
              <button 
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Security
              </button>
              <button 
                className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette className="w-5 h-5 mr-2" />
                Appearance
              </button>
            </div>
            
            {/* Settings Content */}
            <div className="settings-content">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="settings-panel">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  
                  <div className="profile-image-container mb-6">
                    <div className="profile-image">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <label className="upload-button">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
                      <span>{loading ? 'Uploading...' : 'Change Photo'}</span>
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="settings-input"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="settings-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="settings-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="settings-textarea"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`save-button ${
                      saveStatus === 'saving' ? 'saving' : 
                      saveStatus === 'success' ? 'success' : 
                      saveStatus === 'error' ? 'error' : ''
                    }`}
                  >
                    {saveStatus === 'idle' && (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === 'success' && (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Saved!
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <X className="w-5 h-5 mr-2" />
                        Error!
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="settings-panel">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="notification-options">
                    <div className="notification-option">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
                          <p className="text-gray-400">Receive updates and alerts via email</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notifications.email} 
                            onChange={() => handleNotificationChange('email')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="notification-option">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                          <p className="text-gray-400">Receive real-time alerts on your device</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notifications.push} 
                            onChange={() => handleNotificationChange('push')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="notification-option">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">SMS Notifications</h3>
                          <p className="text-gray-400">Receive text messages for important updates</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notifications.sms} 
                            onChange={() => handleNotificationChange('sms')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="notification-option">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Marketing Emails</h3>
                          <p className="text-gray-400">Receive promotional offers and newsletters</p>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={notifications.marketing} 
                            onChange={() => handleNotificationChange('marketing')}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`save-button ${
                      saveStatus === 'saving' ? 'saving' : 
                      saveStatus === 'success' ? 'success' : 
                      saveStatus === 'error' ? 'error' : ''
                    }`}
                  >
                    {saveStatus === 'idle' && (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </>
                    )}
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === 'success' && (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Saved!
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <X className="w-5 h-5 mr-2" />
                        Error!
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <div className="settings-panel">
                  <h2 className="text-2xl font-bold text-white mb-6">User Preferences</h2>
                  
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="settings-select"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="settings-select"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`save-button ${
                      saveStatus === 'saving' ? 'saving' : 
                      saveStatus === 'success' ? 'success' : 
                      saveStatus === 'error' ? 'error' : ''
                    }`}
                  >
                    {saveStatus === 'idle' && (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Preferences
                      </>
                    )}
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === 'success' && (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Saved!
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <X className="w-5 h-5 mr-2" />
                        Error!
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="settings-panel">
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  
                  <div className="form-group">
                    <label htmlFor="password">Current Password</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="settings-input"
                        placeholder="Enter your current password"
                      />
                      <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="settings-input"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <div className="password-input-container">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="settings-input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`save-button ${
                      saveStatus === 'saving' ? 'saving' : 
                      saveStatus === 'success' ? 'success' : 
                      saveStatus === 'error' ? 'error' : ''
                    }`}
                  >
                    {saveStatus === 'idle' && (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Update Password
                      </>
                    )}
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    )}
                    {saveStatus === 'success' && (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Updated!
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <X className="w-5 h-5 mr-2" />
                        Error!
                      </>
                    )}
                  </button>
                  
                  <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Danger Zone</h3>
                    <p className="text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="danger-button">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="settings-panel">
                  <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Dark Mode</h3>
                      <p className="text-gray-400">Toggle between light and dark theme</p>
                    </div>
                    <button 
                      onClick={handleThemeChange}
                      className="theme-toggle-button"
                    >
                      {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Theme Color</h3>
                    <p className="text-gray-400 mb-4">Choose your preferred accent color</p>
                    
                    <div className="color-options">
                      <button 
                        className={`color-option ${themeColor === '#3b82f6' ? 'active' : ''}`}
                        style={{ backgroundColor: '#3b82f6' }}
                        onClick={() => handleColorChange('#3b82f6')}
                      ></button>
                      <button 
                        className={`color-option ${themeColor === '#10b981' ? 'active' : ''}`}
                        style={{ backgroundColor: '#10b981' }}
                        onClick={() => handleColorChange('#10b981')}
                      ></button>
                      <button 
                        className={`color-option ${themeColor === '#f59e0b' ? 'active' : ''}`}
                        style={{ backgroundColor: '#f59e0b' }}
                        onClick={() => handleColorChange('#f59e0b')}
                      ></button>
                      <button 
                        className={`color-option ${themeColor === '#ef4444' ? 'active' : ''}`}
                        style={{ backgroundColor: '#ef4444' }}
                        onClick={() => handleColorChange('#ef4444')}
                      ></button>
                      <button 
                        className={`color-option ${themeColor === '#8b5cf6' ? 'active' : ''}`}
                        style={{ backgroundColor: '#8b5cf6' }}
                        onClick={() => handleColorChange('#8b5cf6')}
                      ></button>
                      <button 
                        className={`color-option ${themeColor === '#ec4899' ? 'active' : ''}`}
                        style={{ backgroundColor: '#ec4899' }}
                        onClick={() => handleColorChange('#ec4899')}
                      ></button>
                    </div>
                  </div>
                  
                  <div className="appearance-option">
                    <h3 className="text-lg font-semibold text-white mb-2">Animation Effects</h3>
                    <p className="text-gray-400 mb-4">Control the level of animations in the interface</p>
                    
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="animationLevel"
                          value="full"
                          defaultChecked
                        />
                        <span>Full Animations</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="animationLevel"
                          value="reduced"
                        />
                        <span>Reduced Animations</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="animationLevel"
                          value="none"
                        />
                        <span>No Animations</span>
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === 'saving'}
                    className={`save-button ${
                      saveStatus === 'saving' ? 'saving' : 
                      saveStatus === 'success' ? 'success' : 
                      saveStatus === 'error' ? 'error' : ''
                    }`}
                  >
                    {saveStatus === 'idle' && (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Theme
                      </>
                    )}
                    {saveStatus === 'saving' && (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === 'success' && (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Saved!
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <X className="w-5 h-5 mr-2" />
                        Error!
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}