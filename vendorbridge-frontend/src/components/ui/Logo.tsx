import { Link } from 'react-router-dom';

interface LogoProps {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  linkTo?: string;
}

export default function Logo({
  iconOnly = false,
  size = 'md',
  className = '',
  linkTo = '/dashboard'
}: LogoProps) {
  // Dimensions based on size prop
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm tracking-wide',
    md: 'text-base tracking-wider',
    lg: 'text-lg tracking-wider',
    xl: 'text-xl tracking-widest',
  };

  const svgContent = (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-105 shrink-0`}
    >
      <defs>
        {/* Monogram Gradient */}
        <linearGradient id="logo-vb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" /> {/* Emerald-500 */}
          <stop offset="50%" stopColor="#06B6D4" /> {/* Cyan-500 */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
        </linearGradient>
        {/* Wave Bridge Gradient */}
        <linearGradient id="logo-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
        </linearGradient>
        {/* Glow Filter */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <style>{`
        @keyframes flowData {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }
        .logo-node-pulse {
          animation: flowData 3.5s infinite linear;
          offset-path: path('M 3,21 Q 20,13 37,21');
        }
      `}</style>

      {/* Background Bridge Wave (The Bridge) */}
      <path
        d="M 3,21 Q 20,13 37,21"
        stroke="url(#logo-wave-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Glowing terminal dots at the ends of the bridge */}
      <circle cx="3" cy="21" r="2" className="fill-emerald-400 animate-pulse" />
      <circle cx="37" cy="21" r="2" className="fill-blue-400 animate-pulse" />

      {/* Animated Flowing Data Particle */}
      <circle
        r="2"
        className="fill-cyan-400 dark:fill-cyan-300 logo-node-pulse"
        style={{ filter: 'url(#logo-glow)' }}
      />

      {/* Monogram VB Path 1: The V-shape and Spine of B */}
      <path
        d="M 8,13 L 17,27 L 25,13 L 25,27"
        stroke="url(#logo-vb-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_2px_4px_rgba(16,185,129,0.15)]"
      />

      {/* Monogram VB Path 2: The B Loops */}
      <path
        d="M 25,13 C 32,13 32,20 25,20 C 33.5,20 33.5,27 25,27"
        stroke="url(#logo-vb-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_2px_4px_rgba(6,180,210,0.15)]"
      />
    </svg>
  );

  const innerContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Wrapper with background glow */}
      <div className="relative group/logo">
        <div className="absolute inset-0 bg-brand-green/5 blur-md rounded-full group-hover/logo:bg-brand-green/10 transition-colors duration-300"></div>
        <div className="relative border border-subtle bg-surface-card/40 rounded-xl p-1.5 flex items-center justify-center shadow-card group-hover/logo:border-brand-green/30 group-hover/logo:shadow-glow transition-all duration-300">
          {svgContent}
        </div>
      </div>

      {/* Brand Text */}
      {!iconOnly && (
        <span className={`font-bold text-text-primary group-hover:text-brand-green transition-colors duration-200 ${textSizes[size]}`}>
          Vendor<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Bridge</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="group flex items-center">
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
