import { UrgencyLevel } from '../types/pantry';

/**
 * Calculates calendar days remaining until midnight of the expiry date
 */
export function getDaysRemaining(expiryIsoString: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const expiryDate = new Date(expiryIsoString);
  const target = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Classifies urgency based on user requirement:
 * - Critical: 1-2 days or already expired / today (diff <= 2)
 * - Warning: 3-5 days (diff >= 3 && diff <= 5)
 * - Fresh: 6+ days (diff >= 6)
 */
export function getUrgencyLevel(expiryIsoString: string): UrgencyLevel {
  const days = getDaysRemaining(expiryIsoString);
  if (days <= 2) return 'critical';
  if (days <= 5) return 'warning';
  return 'fresh';
}

/**
 * User-friendly relative expiry label
 */
export function formatExpiryLabel(expiryIsoString: string): {
  headline: string;
  badgeText: string;
  isExpired: boolean;
  days: number;
} {
  const days = getDaysRemaining(expiryIsoString);
  
  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      headline: `Expired ${absDays === 1 ? 'yesterday' : `${absDays} days ago`}`,
      badgeText: 'Expired',
      isExpired: true,
      days,
    };
  }
  
  if (days === 0) {
    return {
      headline: 'Expires today',
      badgeText: 'Critical · Today',
      isExpired: false,
      days,
    };
  }
  
  if (days === 1) {
    return {
      headline: 'Expires tomorrow',
      badgeText: 'Critical · 1 Day',
      isExpired: false,
      days,
    };
  }
  
  if (days === 2) {
    return {
      headline: 'Expires in 2 days',
      badgeText: 'Critical · 2 Days',
      isExpired: false,
      days,
    };
  }
  
  if (days <= 5) {
    return {
      headline: `Expires in ${days} days`,
      badgeText: `Warning · ${days} Days`,
      isExpired: false,
      days,
    };
  }
  
  if (days <= 7) {
    return {
      headline: `Expires in 1 week (${days}d)`,
      badgeText: 'Fresh · 1 Week',
      isExpired: false,
      days,
    };
  }
  
  if (days <= 14) {
    return {
      headline: `Expires in 2 weeks (${days}d)`,
      badgeText: `Fresh · ${days} Days`,
      isExpired: false,
      days,
    };
  }
  
  return {
    headline: `Expires in ${days} days`,
    badgeText: `Fresh · ${days} Days`,
    isExpired: false,
    days,
  };
}

/**
 * Format full date e.g. "Sat, Nov 7" or "Nov 7, 2026"
 */
export function formatCalendarDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return isoString;
  }
}

/**
 * Returns ISO string for today + N days at 23:59:59
 */
export function getDateWithOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Parse smart voice phrases like "Add Milk expiring in 4 days"
 */
export function parseVoiceInputPhrase(text: string): {
  itemName: string;
  daysOffset: number;
} | null {
  const cleaned = text.trim();
  if (!cleaned) return null;

  let days = 4; // default sensible expiry if unspecified
  let name = cleaned;

  // Remove common speech fillers
  name = name.replace(/^(please\s+)?(add|put|buy|bought|log|insert)\s+/i, '');

  // Check for "expiring in X days/weeks/month" or "expires in X days"
  const expireMatch = name.match(/\s*(?:expiring|expires|expiry|lasts)\s+(?:in\s+)?(\d+|a|an|one|two|three|four|five|six|seven)?\s*(day|days|week|weeks|month|months|tomorrow|today)/i);

  if (expireMatch) {
    const numPart = (expireMatch[1] || '').toLowerCase();
    const unitPart = expireMatch[2].toLowerCase();

    let count = 1;
    if (numPart === 'a' || numPart === 'an' || numPart === 'one') count = 1;
    else if (numPart === 'two') count = 2;
    else if (numPart === 'three') count = 3;
    else if (numPart === 'four') count = 4;
    else if (numPart === 'five') count = 5;
    else if (numPart === 'six') count = 6;
    else if (numPart === 'seven') count = 7;
    else if (!isNaN(parseInt(numPart, 10))) count = parseInt(numPart, 10);

    if (unitPart.startsWith('day')) {
      days = count;
    } else if (unitPart.startsWith('week')) {
      days = count * 7;
    } else if (unitPart.startsWith('month')) {
      days = count * 30;
    } else if (unitPart === 'tomorrow') {
      days = 1;
    } else if (unitPart === 'today') {
      days = 0;
    }

    // Strip the expiry clause from item name
    name = name.slice(0, expireMatch.index).trim();
  }

  // Capitalize properly
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    itemName: name || 'Grocery Item',
    daysOffset: Math.max(0, days),
  };
}
