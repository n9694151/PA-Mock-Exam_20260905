import { UserProfile } from '../types';

const KEYS = {
  CURRENT_USER: 'patent_current_user_email_v1',
  PROFILES: 'patent_user_profiles_v1',
  RECENT_EMAILS: 'patent_recent_emails_v1',
};

const AUTH_EVENT_NAME = 'patent_auth_state_changed';

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export const authService = {
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    // Standard RFC-compliant email regex pattern
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(trimmed);
  },

  getCurrentUser(): UserProfile | null {
    const currentEmail = safeGetItem<string | null>(KEYS.CURRENT_USER, null);
    if (!currentEmail) return null;

    const profiles = safeGetItem<Record<string, UserProfile>>(KEYS.PROFILES, {});
    const existing = profiles[currentEmail.toLowerCase()];
    if (existing) return existing;

    // Fallback if profile missing
    const fallbackProfile: UserProfile = {
      email: currentEmail.toLowerCase(),
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    profiles[currentEmail.toLowerCase()] = fallbackProfile;
    safeSetItem(KEYS.PROFILES, profiles);
    return fallbackProfile;
  },

  login(rawEmail: string): UserProfile {
    const email = rawEmail.trim().toLowerCase();
    if (!this.isValidEmail(email)) {
      throw new Error('請輸入正確格式的電子信箱（例：candidate@patent.tw）');
    }

    const profiles = safeGetItem<Record<string, UserProfile>>(KEYS.PROFILES, {});
    const now = Date.now();
    let profile = profiles[email];

    if (profile) {
      profile.lastLoginAt = now;
    } else {
      profile = {
        email,
        createdAt: now,
        lastLoginAt: now,
      };
    }
    profiles[email] = profile;
    safeSetItem(KEYS.PROFILES, profiles);
    safeSetItem(KEYS.CURRENT_USER, email);

    // Update recent emails list (max 5)
    const recents = safeGetItem<string[]>(KEYS.RECENT_EMAILS, []);
    const updatedRecents = [email, ...recents.filter((e) => e.toLowerCase() !== email)].slice(0, 5);
    safeSetItem(KEYS.RECENT_EMAILS, updatedRecents);

    // Notify listeners
    this.notifyAuthStateChanged(profile);

    return profile;
  },

  logout(): void {
    try {
      localStorage.removeItem(KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Error during logout', e);
    }
    this.notifyAuthStateChanged(null);
  },

  getRecentUsers(): string[] {
    return safeGetItem<string[]>(KEYS.RECENT_EMAILS, []);
  },

  notifyAuthStateChanged(user: UserProfile | null): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(AUTH_EVENT_NAME, {
          detail: { user },
        })
      );
    }
  },

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: UserProfile | null }>;
      callback(customEvent.detail?.user || null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_EVENT_NAME, handler);
      return () => {
        window.removeEventListener(AUTH_EVENT_NAME, handler);
      };
    }
    return () => {};
  },
};
