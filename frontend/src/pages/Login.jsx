import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { Camera, LogIn, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { loginUser, loading } = useApp();
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  // Load photo from local storage on mount if exists
  useEffect(() => {
    const savedPhoto = localStorage.getItem('vb_photo');
    if (savedPhoto) {
      setPhoto(savedPhoto);
    }
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhoto(base64String);
        localStorage.setItem('vb_photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!username) {
      tempErrors.username = 'Username or email address is required.';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Use username as the email for the existing loginUser mock API
    const success = await loginUser(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 px-4 py-12 grid-lines">
      {/* Outer Card (Box 1) */}
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            VendorBridge Login
          </h2>
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Sign in to manage your procurement network
          </p>
        </div>

        {/* Inner Card (Box 2) */}
        <div className="bg-slate-50/50 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-inner space-y-6">
          
          {/* Photo Circular Container */}
          <div className="flex flex-col items-center justify-center">
            <label htmlFor="photo-upload" className="relative group cursor-pointer block">
              <div className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-brand-500 group-hover:shadow-lg group-hover:shadow-brand-500/10">
                {photo ? (
                  <img src={photo} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 dark:text-neutral-500">
                    <span className="font-display text-sm font-semibold tracking-wider uppercase">Photo</span>
                    <Camera className="w-4 h-4 mt-1 opacity-60 group-hover:scale-110 transition-transform" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-xxs font-bold uppercase tracking-wider">Change</span>
              </div>
            </label>
            <input 
              type="file" 
              id="photo-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoChange} 
            />
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              placeholder="sarah.jenkins"
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
            />

            {/* Login Button Container - Centered */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 active:scale-98 transition-all hover-glow-button"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Login</span>
                    <LogIn className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Mode / Alternative Actions */}
        <div className="space-y-4 pt-2">
          {/* Quick Demo Log In (Bypass Auth) */}
          <button
            type="button"
            onClick={async () => {
              const success = await loginUser('sarah.j@vendorbridge.com', 'password');
              if (success) {
                navigate('/dashboard');
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-850 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-neutral-800 transition-all select-none cursor-pointer"
          >
            <span>Demo Mode (Bypass Auth)</span>
          </button>

          {/* Redirect Section */}
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-neutral-500">
              Don't have an enterprise account?{' '}
              <Link to="/signup" className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-0.5">
                Create an account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
