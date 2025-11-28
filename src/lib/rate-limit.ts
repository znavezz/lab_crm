/**
 * Rate Limiting Utility
 * 
 * In-memory rate limiting to prevent brute force attacks.
 * Uses LRU cache with TTL for automatic cleanup.
 * 
 * For production with multiple servers, consider:
 * - Redis-based rate limiting (@upstash/ratelimit)
 * - Edge rate limiting (Cloudflare, Vercel)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Timestamp when count resets
}

// In-memory store for rate limit data
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Unique identifier for this rate limiter
   * (e.g., 'login', 'password-reset', 'sms')
   */
  name: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Total limit
   */
  limit: number;

  /**
   * Time (in seconds) until the rate limit resets
   */
  resetIn: number;

  /**
   * Error message if not allowed
   */
  error?: string;
}

/**
 * Check if a request is allowed based on rate limiting
 * 
 * @param identifier - Unique identifier for the requester (e.g., IP, user ID, email)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.name}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Get existing entry or create new one
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry (first request or window expired)
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      limit: config.maxRequests,
      resetIn: config.windowSeconds,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      limit: config.maxRequests,
      resetIn,
      error: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
    };
  }

  // Request allowed
  const resetIn = Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    limit: config.maxRequests,
    resetIn,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual overrides
 */
export function resetRateLimit(identifier: string, limitName: string): void {
  const key = `${limitName}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  /** Login attempts: 5 per 15 minutes */
  LOGIN: {
    name: 'login',
    maxRequests: 5,
    windowSeconds: 15 * 60,
  },

  /** Password reset: 3 per hour */
  PASSWORD_RESET: {
    name: 'password-reset',
    maxRequests: 3,
    windowSeconds: 60 * 60,
  },

  /** SMS sending: 5 per hour */
  SMS_SEND: {
    name: 'sms-send',
    maxRequests: 5,
    windowSeconds: 60 * 60,
  },

  /** Email verification: 5 per hour */
  EMAIL_VERIFY: {
    name: 'email-verify',
    maxRequests: 5,
    windowSeconds: 60 * 60,
  },

  /** WebAuthn registration: 10 per hour */
  WEBAUTHN_REGISTER: {
    name: 'webauthn-register',
    maxRequests: 10,
    windowSeconds: 60 * 60,
  },

  /** API general: 100 per 15 minutes */
  API_GENERAL: {
    name: 'api-general',
    maxRequests: 100,
    windowSeconds: 15 * 60,
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address or user ID if available
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers (works with proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  // Fallback: use a generic identifier
  // Note: This won't work well in production behind a proxy
  return 'ip:unknown';
}

/**
 * Middleware helper to apply rate limiting to an API route
 */
export async function withRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request, userId);
  return checkRateLimit(identifier, config);
}

