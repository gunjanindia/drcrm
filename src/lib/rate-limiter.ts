/**
 * Digital Ranchi — API Rate Limiter & Anti-Abuse Engine
 * 
 * Protects public endpoints (like /api/audit) against spam, automated bots, scrapers, and quota abuse.
 * Policy: Maximum 3 free scans per 24 hours per IP / Phone / Device identifier.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  firstRequestAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired keys every 30 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 30 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetHours: number;
  resetMinutes: number;
  resetMessage: string;
  totalLimit: number;
}

/**
 * Check and record a rate-limited request
 * @param identifier Client IP address, phone number, or unique session token
 * @param maxRequests Maximum allowed requests in the window (default: 3 per day)
 * @param windowMs Window duration in milliseconds (default: 24 hours = 86,400,000ms)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 24 * 60 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const cleanId = (identifier || 'unknown-client').trim().toLowerCase();
  const record = rateLimitMap.get(cleanId);

  if (!record || now > record.resetAt) {
    // New 24-hour window for this identifier
    rateLimitMap.set(cleanId, {
      count: 1,
      resetAt: now + windowMs,
      firstRequestAt: now,
    });

    const resetHours = Math.ceil(windowMs / (60 * 60 * 1000));
    const resetMinutes = Math.ceil(windowMs / (60 * 1000));

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      resetHours,
      resetMinutes,
      resetMessage: `You have ${maxRequests - 1} free scans remaining today.`,
      totalLimit: maxRequests,
    };
  }

  const remainingMs = Math.max(0, record.resetAt - now);
  const resetHours = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
  const resetMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetHours,
      resetMinutes,
      resetMessage: `Daily limit reached (${maxRequests} scans per day). Please try again in ${resetHours} hour${resetHours > 1 ? 's' : ''} or contact Digital Ranchi growth team on WhatsApp.`,
      totalLimit: maxRequests,
    };
  }

  record.count += 1;
  const remainingCount = Math.max(0, maxRequests - record.count);

  return {
    allowed: true,
    remaining: remainingCount,
    resetHours,
    resetMinutes,
    resetMessage: remainingCount === 0
      ? `This was your last free scan for today. Quota resets in ${resetHours} hours.`
      : `You have ${remainingCount} free scan${remainingCount > 1 ? 's' : ''} remaining today.`,
    totalLimit: maxRequests,
  };
}

