/**
 * Google Calendar Integration Service
 * Handles creating calendar events for maintenance, realtor meetings, and owner meetings.
 * Uses the Google Calendar API via OAuth2.
 */

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  scopes: 'https://www.googleapis.com/auth/calendar.events',
};

export const EVENT_TYPES = {
  MAINTENANCE: 'maintenance',
  REALTOR_MEETING: 'realtor_meeting',
  OWNER_MEETING: 'owner_meeting',
};

const EVENT_COLORS = {
  [EVENT_TYPES.MAINTENANCE]: '6',      // Tangerine (orange)
  [EVENT_TYPES.REALTOR_MEETING]: '2',  // Sage (green)
  [EVENT_TYPES.OWNER_MEETING]: '9',    // Blueberry
};

const EVENT_LABELS = {
  [EVENT_TYPES.MAINTENANCE]: 'Maintenance Request',
  [EVENT_TYPES.REALTOR_MEETING]: 'Realtor Meeting',
  [EVENT_TYPES.OWNER_MEETING]: 'Property Owner Meeting',
};

/**
 * Load the Google API (gapi) script dynamically.
 */
export function loadGoogleApi() {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve(window.gapi);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve(window.gapi);
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize the Google API client.
 */
export async function initGoogleApi() {
  const gapi = await loadGoogleApi();
  await new Promise((resolve, reject) => {
    gapi.load('client:auth2', { callback: resolve, onerror: reject });
  });
  await gapi.client.init({
    apiKey: GOOGLE_CONFIG.apiKey,
    clientId: GOOGLE_CONFIG.clientId,
    discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
    scope: GOOGLE_CONFIG.scopes,
  });
  return gapi;
}

/**
 * Sign in with Google to authorize calendar access.
 */
export async function signInWithGoogle() {
  const gapi = await initGoogleApi();
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn();
  }
  return authInstance.currentUser.get();
}

/**
 * Build a Google Calendar event object.
 */
export function buildCalendarEvent({ type, title, description, location, startDateTime, endDateTime, attendees = [] }) {
  return {
    summary: title || `[${EVENT_LABELS[type] || 'Event'}]`,
    description: description || '',
    location: location || '',
    colorId: EVENT_COLORS[type] || '1',
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: attendees.map((email) => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
    extendedProperties: {
      private: { eventType: type },
    },
  };
}

/**
 * Create a Google Calendar event (requires prior auth).
 */
export async function createCalendarEvent(eventData) {
  try {
    const gapi = window.gapi;
    if (!gapi?.client?.calendar) {
      throw new Error('Google Calendar API not initialized');
    }
    const event = buildCalendarEvent(eventData);
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return { success: true, event: response.result };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a Google Calendar "add event" URL (works without OAuth for quick-add).
 */
export function buildCalendarUrl({ type, title, description, location, startDateTime, endDateTime }) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const fmt = (d) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || EVENT_LABELS[type] || 'Event',
    details: description || '',
    location: location || '',
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
