/**
 * Collision System Constants
 * Based on 04_collision_system.md specification
 */

// World Step Configuration (Anti-Tunneling)
export const WORLD_STEP_CONFIG = {
  fixedTimeStep: 1 / 60, // 60Hz
  maxSubSteps: 10, // Frame drop compensation
} as const;

// Velocity Clamping (Anti-Tunneling)
export const VELOCITY_CONFIG = {
  maxVelocity: 15.0, // unit/s
} as const;

// Collider Configuration
export const COLLIDER_CONFIG = {
  // Prong (Claw Finger) - Kinematic
  prong: {
    minRadius: 0.1, // 10cm minimum for tunneling prevention
    friction: 0.9,
    restitution: 0,
  },
  // Doll - Dynamic
  doll: {
    friction: 0.6,
    restitution: 0.1,
    massMin: 0.3,
    massMax: 1.2,
  },
  // Floor - Static
  floor: {
    friction: 0.8,
    restitution: 0.1,
  },
  // Exit Edge - Static
  exitEdge: {
    friction: 0.5,
    restitution: 0.1,
  },
} as const;

// Grip Detection Configuration
export const GRIP_DETECTION_CONFIG = {
  // Minimum prongs required for grip
  minProngsForGrip: 2,
  // Contact duration required for grip (ms)
  contactDurationThreshold: 120,
  // Center offset threshold for slip (cm)
  centerOffsetThreshold: 1.5,
} as const;

// Damping Configuration (Natural Grip)
export const DAMPING_CONFIG = {
  // Default values
  default: {
    linearDamping: 0.01,
    angularDamping: 0.01,
  },
  // On Grip state
  onGrip: {
    linearDamping: 0.8,
    angularDamping: 0.9,
  },
} as const;

// Squeeze Force Configuration (Natural Grip)
export const SQUEEZE_FORCE_CONFIG = {
  // Force multiplier (relative to mass)
  forceMultiplier: 5.0, // ~0.5x gravity
  // Y component is always 0 (horizontal only)
  verticalComponent: 0,
} as const;

// Slip Detection Configuration
export const SLIP_CONFIG = {
  // Minimum prongs for stable grip
  minProngsForStable: 2,
  // Center offset threshold (cm)
  centerOffsetThreshold: 1.5,
  // Downward force on slip
  slipDownwardForce: 2.0,
  // Rotation force on slip
  slipRotationForce: 1.0,
} as const;

// Fall Detection Configuration
export const FALL_CONFIG = {
  // Y velocity threshold for fall detection (m/s)
  velocityThreshold: -5.0,
} as const;

// Success Detection Configuration
export const SUCCESS_CONFIG = {
  // Exit hole trigger zone
  exitZone: {
    x: { min: 1.5, max: 2.5 },
    y: { min: -1.0, max: 1.0 },
    z: { min: 1.0, max: 2.0 },
  },
} as const;

// Debug Configuration
export const DEBUG_CONFIG = {
  // Enable debug overlay
  enabled: false,
  // Wireframe display for colliders
  showWireframes: false,
  // Highlight active contacts
  highlightContacts: true,
} as const;
