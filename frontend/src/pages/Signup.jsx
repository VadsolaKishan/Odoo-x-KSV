import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { Camera, UserPlus, ArrowLeft } from 'lucide-react';

export const Signup = () => {
  const { signupUser, loading } = useApp();
  const navigate = useNavigate();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('officer');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
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
    if (!firstName) tempErrors.firstName = 'First name is required.';
    if (!lastName) tempErrors.lastName = 'Last name is required.';
    
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address.';
    }

    if (!phone) {
      tempErrors.phone = 'Phone number is required.';
    }

    if (!country) {
      tempErrors.country = 'Country is required.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Combine First & Last Name
    const fullName = `${firstName} ${lastName}`.trim();
    // Pass a default password since the registration wireframe has no password field
    const success = await signupUser(fullName, email, 'password');
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-neutral-950 px-4 py-12 grid-lines">
      {/* Outer Card (Box 1) */}
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight">
            Register for VendorBridge
          </h2>
          <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
            Create your procurement profile and get started
          </p>
        </div>

        {/* Photo Circular Container - Placed at the top center of Box 1 */}
        <div className="flex flex-col items-center justify-center pt-2">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inner Card (Box 2) containing all fields */}
          <div className="bg-slate-50/50 dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800/80 rounded-2xl p-6 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <FormInput
                label="First Name"
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                placeholder="Sarah"
              />

              <FormInput
                label="Last Name"
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                placeholder="Jenkins"
              />

              <FormInput
                label="Email Address"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="sarah.jenkins@vendorbridge.com"
              />

              <FormInput
                label="Phone Number"
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                placeholder="+1 (555) 019-2834"
              />

              <FormInput
                label="Role"
                id="role"
                type="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'officer', label: 'Officer' }
                ]}
              />

              <FormInput
                label="Country"
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                error={errors.country}
                placeholder="United States"
              />

              <FormInput
                className="md:col-span-2"
                label="Additional Information"
                id="additionalInfo"
                type="textarea"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Enter any additional department information or details..."
              />
            </div>
          </div>

          {/* Centered Register Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 active:scale-98 transition-all hover-glow-button"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Register</span>
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Redirect Section */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-neutral-500">
            Already have an enterprise account?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 justify-center">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
