'use client';

export default function AnimatedLogoLoader({ size = 120 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-label="Interview Coach Brain AI Animated Speech Bubble Logo"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Dark Navy to Deep Royal Gradient */}
        <linearGradient id="navyGradAnim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="60%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Electric Cyan Neural Gradient */}
        <linearGradient id="cyanNeuralAnim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        {/* Glowing Filters */}
        <filter id="cyanGlowAnim" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#0ea5e9" floodOpacity="0.85" />
        </filter>
      </defs>

      {/* Speech Bubble Main Silhouette Path (Dark Navy to Cyan Gradient) */}
      <path
        className="drawSpeechBubble"
        d="M 140 120 
           H 372 
           C 412 120, 442 150, 442 190 
           V 290 
           C 442 330, 412 360, 372 360 
           H 260 
           L 180 415 
           V 360 
           H 140 
           C 100 360, 70 330, 70 290 
           V 190 
           C 70 150, 100 120, 140 120 Z"
        fill="none"
        stroke="url(#navyGradAnim)"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Neural Brain Network - Left Hemisphere Synapses */}
      <path
        className="drawLeftHemisphere"
        d="M 240 170 
           C 200 170, 150 190, 150 235 
           C 150 260, 170 275, 190 280 
           C 170 295, 180 320, 210 320 
           C 230 320, 245 305, 250 290"
        fill="none"
        stroke="url(#cyanNeuralAnim)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Neural Brain Network - Right Hemisphere Synapses */}
      <path
        className="drawRightHemisphere"
        d="M 272 170 
           C 312 170, 362 190, 362 235 
           C 362 260, 342 275, 322 280 
           C 342 295, 332 320, 302 320 
           C 282 320, 267 305, 262 290"
        fill="none"
        stroke="url(#cyanNeuralAnim)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Brain Central Fissure Core Line */}
      <line
        className="drawFissure"
        x1="256"
        y1="165"
        x2="256"
        y2="315"
        stroke="url(#cyanNeuralAnim)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="14 10"
      />

      {/* Interconnecting Circuit Synapses */}
      <line className="drawCircuits" x1="200" y1="210" x2="256" y2="235" stroke="url(#cyanNeuralAnim)" strokeWidth="6" opacity="0.8" />
      <line className="drawCircuits" x1="312" y1="210" x2="256" y2="235" stroke="url(#cyanNeuralAnim)" strokeWidth="6" opacity="0.8" />
      <line className="drawCircuits" x1="190" y1="280" x2="256" y2="265" stroke="url(#cyanNeuralAnim)" strokeWidth="6" opacity="0.8" />
      <line className="drawCircuits" x1="322" y1="280" x2="256" y2="265" stroke="url(#cyanNeuralAnim)" strokeWidth="6" opacity="0.8" />

      {/* Glowing Neural AI Node Dots (Electric Cyan) */}
      {/* Top Center Intelligence Node */}
      <g className="popNodes">
        <circle cx="256" cy="165" r="16" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="256" cy="165" r="7" fill="#ffffff" />
      </g>

      {/* Left Frontal Node */}
      <g className="popNodes">
        <circle cx="200" cy="210" r="12" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="200" cy="210" r="5" fill="#ffffff" />
      </g>

      {/* Right Frontal Node */}
      <g className="popNodes">
        <circle cx="312" cy="210" r="12" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="312" cy="210" r="5" fill="#ffffff" />
      </g>

      {/* Central Synapse Hub */}
      <g className="popNodes">
        <circle cx="256" cy="235" r="18" fill="#38bdf8" filter="url(#cyanGlowAnim)" />
        <circle cx="256" cy="235" r="8" fill="#ffffff" />
      </g>

      {/* Left Temporal Node */}
      <g className="popNodes">
        <circle cx="190" cy="280" r="12" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="190" cy="280" r="5" fill="#ffffff" />
      </g>

      {/* Right Temporal Node */}
      <g className="popNodes">
        <circle cx="322" cy="280" r="12" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="322" cy="280" r="5" fill="#ffffff" />
      </g>

      {/* Bottom Core Node */}
      <g className="popNodes">
        <circle cx="256" cy="315" r="15" fill="#0ea5e9" filter="url(#cyanGlowAnim)" />
        <circle cx="256" cy="315" r="6" fill="#ffffff" />
      </g>
    </svg>
  );
}
