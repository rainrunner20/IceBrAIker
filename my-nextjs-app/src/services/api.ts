export interface ProfileData {
  source?: string;
  display_name?: string;
  summary_and_facts: { summary: string; facts: string[] };
  interests: { topics_of_interest: string[] };
  ice_breakers: { ice_breakers: string[] };
  picture_url: string | null;
}

const demo: ProfileData = {
  source: 'synthetic_demo',
  display_name: 'Jordan Parker (fictional)',
  summary_and_facts: {
    summary: 'Jordan is a fictional product engineer who enjoys designing accessible interfaces and explaining trade-offs to teammates.',
    facts: ['Built a fictional urban mobility dashboard.', 'Prefers testing prototypes with real users.'],
  },
  interests: { topics_of_interest: ['Accessibility', 'Urban data', 'Product engineering'] },
  ice_breakers: { ice_breakers: [
    'What was the hardest trade-off in your last prototype?',
    'If you could improve one part of your commute, what would you change?',
  ] },
  picture_url: null,
};

export function getFictionalDemo(): Promise<ProfileData> {
  // Works offline in the browser and never claims to identify a real person.
  return Promise.resolve(demo);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseProfile(value: unknown): ProfileData {
  if (!isObject(value) || !isObject(value.summary_and_facts) ||
      !isObject(value.interests) || !isObject(value.ice_breakers)) {
    throw new Error('The backend returned an unexpected profile response.');
  }
  const summary = value.summary_and_facts;
  const interests = value.interests;
  const iceBreakers = value.ice_breakers;
  if (typeof summary.summary !== 'string' ||
      !Array.isArray(summary.facts) || !summary.facts.every(x => typeof x === 'string') ||
      !Array.isArray(interests.topics_of_interest) ||
      !interests.topics_of_interest.every(x => typeof x === 'string') ||
      !Array.isArray(iceBreakers.ice_breakers) ||
      !iceBreakers.ice_breakers.every(x => typeof x === 'string')) {
    throw new Error('The backend returned incomplete profile data.');
  }
  return {
    summary_and_facts: { summary: summary.summary, facts: summary.facts as string[] },
    interests: { topics_of_interest: interests.topics_of_interest as string[] },
    ice_breakers: { ice_breakers: iceBreakers.ice_breakers as string[] },
    picture_url: typeof value.picture_url === 'string' && value.picture_url.startsWith('https://')
      ? value.picture_url : null,
  };
}

export async function getIceBreakerData(name: string): Promise<ProfileData> {
  const cleanName = name.trim().replace(/\s+/g, ' ');
  if (cleanName.length < 2 || cleanName.length > 100) {
    throw new Error('Please enter a name between 2 and 100 characters.');
  }

  const origin = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!origin) {
    throw new Error('Live profile research is not configured. Use the fictional demo instead.');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(origin + '/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName }),
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = isObject(payload) && typeof payload.error === 'string'
        ? payload.error : 'The provider could not generate a profile.';
      throw new Error(message);
    }
    return parseProfile(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('The profile request timed out.');
    }
    if (error instanceof TypeError) {
      throw new Error('The backend is unavailable. Check its URL and status.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
