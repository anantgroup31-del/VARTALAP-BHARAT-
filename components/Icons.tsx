import React, { memo } from 'react';

interface IconProps {
  className?: string;
}

export const VartalapBharatLogo = memo(({ className = "w-20 h-20" }: IconProps) => (
  <div className={`relative flex flex-col items-center justify-center ${className}`}>
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-md">
      {/* Tricolor Arc with Ashoka Chakra */}
      <g transform="translate(0, -20)">
        <path d="M100 280C100 120 200 50 300 50C400 50 500 120 500 280" stroke="#E53E3E" strokeWidth="45" strokeLinecap="round" opacity="0.95" />
        <path d="M125 280C125 150 210 90 300 90C390 90 475 150 475 280" stroke="white" strokeWidth="45" strokeLinecap="round" />
        <path d="M150 280C150 180 220 130 300 130C380 130 450 180 450 280" stroke="#138808" strokeWidth="45" strokeLinecap="round" opacity="0.95" />
        
        {/* Ashoka Chakra */}
        <g transform="translate(300, 90)">
          <circle r="22" stroke="#000080" strokeWidth="2.5" fill="white" />
          <circle r="4" fill="#000080" />
          {[...Array(24)].map((_, i) => (
            <line 
              key={i} 
              x1="0" y1="0" 
              x2={22 * Math.cos(i * Math.PI / 12)} 
              y2={22 * Math.sin(i * Math.PI / 12)} 
              stroke="#000080" strokeWidth="1" 
            />
          ))}
        </g>
      </g>

      {/* Handshake Illustration */}
      <g transform="translate(100, 180) scale(1.1)">
        {/* Left Arm (Orange Sleeve) */}
        <path d="M20 60C20 60 50 40 80 60L100 80L80 100C50 120 20 100 20 100Z" fill="#E53E3E" stroke="#2D3748" strokeWidth="2" />
        <path d="M30 65L70 65M30 75L70 75M30 85L70 85" stroke="#2D3748" strokeWidth="1" opacity="0.3" />
        
        {/* Right Arm (Red Sleeve) */}
        <path d="M280 60C280 60 250 40 220 60L200 80L220 100C250 120 280 100 280 100Z" fill="#E53E3E" stroke="#2D3748" strokeWidth="2" />
        <path d="M270 65L230 65M270 75L230 75M270 85L230 85" stroke="#2D3748" strokeWidth="1" opacity="0.3" />

        {/* Hands Shaking */}
        <path d="M100 80C120 60 180 60 200 80C210 90 200 110 180 110C160 110 140 90 120 110C100 110 90 90 100 80Z" fill="#FEEBC8" stroke="#2D3748" strokeWidth="3" />
        <path d="M140 85C145 80 155 80 160 85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
        <path d="M135 95C140 90 160 90 165 95" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Typography */}
      <text x="250" y="380" textAnchor="middle" fill="#E53E3E" fontSize="64" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '2px' }}>VARTALAP</text>
      
      <g transform="translate(250, 450)">
        <text x="0" y="0" textAnchor="middle" fill="#138808" fontSize="72" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '4px' }}>BHARAT</text>
        
        {/* Decorative Stars */}
        <path d="M-180 -20 L-170 -40 L-160 -20 L-180 -28 L-160 -28 Z" fill="#E53E3E" />
        <path d="M160 -20 L170 -40 L180 -20 L160 -28 L180 -28 Z" fill="#E53E3E" />
        
        {/* Underline Arc */}
        <path d="M-150 20 Q0 50 150 20" stroke="#138808" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  </div>
));

export const StarIcon = memo(({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1.5l3.09 6.26L22 8.75l-5 4.87 1.18 6.88L12 17.25l-6.18 3.25L7 13.62l-5-4.87 6.91-1l3.09-6.25z" />
  </svg>
));

export const HomeIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
));

export const PlusIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
));

export const PersonIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
));

export const SearchIcon = memo(({ className = "w-5 h-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
));

export const MenuIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
));

export const HeartIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
));

export const ChevronRightIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
));

export const SendIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
  </svg>
));

export const UpdatesIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0"></path>
    <path d="M3 12a9 9 0 0 1 9-9"></path>
  </svg>
));

export const ToolsIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
));

export const PhoneIcon = memo(({ className = "w-5 h-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .8 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .8 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
));

export const VideoIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
));

export const BackIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
));

export const LoanIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
));

export const ContactIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
));

export const SparkleIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l1.912 3.873 4.275.621-3.093 3.016.73 4.257L12 12.75l-3.824 2.017.73-4.257-3.093-3.016 4.275-.621z" />
  </svg>
));

export const FlagIcon = memo(({ className = "w-5 h-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22V2M4 4.5C4 4.5 7 3 12 4.5C17 6 20 4.5 20 4.5V14.5C20 14.5 17 16 12 14.5C7 13 4 14.5 4 14.5" />
  </svg>
));

export const NewsIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <line x1="6" y1="8" x2="10" y2="8"></line>
    <line x1="6" y1="12" x2="18" y2="12"></line>
    <line x1="6" y1="16" x2="18" y2="16"></line>
  </svg>
));

export const BazaarIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
));

export const WeatherIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v2"></path>
    <path d="m4.93 4.93 1.41 1.41"></path>
    <path d="M20 12h2"></path>
    <path d="m19.07 19.07-1.41-1.41"></path>
    <path d="M12 20v2"></path>
    <path d="m6.34 17.66-1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="m7.76 7.76-1.41-1.41"></path>
    <circle cx="12" cy="12" r="4"></circle>
  </svg>
));

export const GoldIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 20V9c0-2 2-3 4-3s4 1 4 3v11"></path>
    <path d="M14 20V5c0-2 2-3 4-3s4 1 4 3v15"></path>
    <path d="M2 20h20"></path>
  </svg>
));

export const SOSIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
));

export const MapPinIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
));

export const CameraIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
));

export const VehicleIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"></path>
    <circle cx="7" cy="17" r="2"></circle>
    <path d="M9 17h6"></path>
    <circle cx="17" cy="17" r="2"></circle>
  </svg>
));

export const ChatIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
));

export const MicIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
));

export const ShoppingBagIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
));

export const StickerIcon = memo(({ className = "w-6 h-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
    <path d="M12 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
    <path d="M12 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
  </svg>
));