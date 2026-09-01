/**
 * Digital Ranchi — In-Memory API Rate Limiter
 * 
 * Protects public endpoints (like /api/audit) against spam, scrapers, and API quota abuse.
 * Default: Max 5 requests per IP per 60-minute window.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up expired keys every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequestMap.entries()) {
      if (now > record.resetAt) {
        ipRequestMap.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMinutes: number;
  totalLimit: number;
}

/**
 * Check and record a rate-limited request
 * @param identifier Client IP address or unique session token
 * @param maxRequests Maximum allowed requests in the window (default: 5)
 * @param windowMs Window duration in milliseconds (default: 1 hour = 3600000ms)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const cleanId = identifier || 'unknown-client';
  const record = ipRequestMap.get(cleanId);

  if (!record || now > record.resetAt) {
    // New window for this IP
    ipRequestMap.set(cleanId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetMinutes: Math.ceil(windowMs / 60000),
      totalLimit: maxRequests,
    };
  }

  if (record.count >= maxRequests) {
    const resetMinutes = Math.max(1, Math.ceil((record.resetAt - now) / 60000));
    return {
      allowed: false,
      remaining: 0,
      resetMinutes,
      totalLimit: maxRequests,
    };
  }

  record.count += 1;
  const resetMinutes = Math.max(1, Math.ceil((record.resetAt - now) / 60000));

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMinutes,
    totalLimit: maxRequests,
  };
}
