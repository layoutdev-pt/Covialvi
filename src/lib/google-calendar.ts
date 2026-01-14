import { createServiceClient } from '@/lib/supabase/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: { email: string }[];
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for tokens');
  }

  return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to refresh token');
  }

  return response.json();
}

/**
 * Store tokens in Supabase
 */
export async function storeTokens(
  userId: string,
  tokens: GoogleTokens
): Promise<void> {
  const supabase = createServiceClient();
  
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { error } = await supabase
    .from('google_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: expiresAt,
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store tokens');
  }
}

/**
 * Get valid access token for user (refreshes if expired)
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = createServiceClient();

  const { data: tokenData, error } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !tokenData) {
    return null;
  }

  // Check if token is expired (with 5 min buffer)
  const expiresAt = new Date(tokenData.expires_at);
  const now = new Date();
  const bufferMs = 5 * 60 * 1000;

  if (expiresAt.getTime() - bufferMs > now.getTime()) {
    return tokenData.access_token;
  }

  // Token expired, try to refresh
  if (!tokenData.refresh_token) {
    return null;
  }

  try {
    const newTokens = await refreshAccessToken(tokenData.refresh_token);
    await storeTokens(userId, {
      ...newTokens,
      refresh_token: newTokens.refresh_token || tokenData.refresh_token,
    });
    return newTokens.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Check if user has connected Google Calendar
 */
export async function hasGoogleCalendarConnected(userId: string): Promise<boolean> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('google_tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

/**
 * Disconnect Google Calendar (remove tokens)
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('google_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to disconnect Google Calendar');
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  userId: string,
  event: CalendarEvent
): Promise<string | null> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    console.log('No valid access token for user:', userId);
    return null;
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating calendar event:', error);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok || response.status === 404;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/**
 * Create visit calendar event
 */
export async function createVisitCalendarEvent(
  consultantId: string,
  visit: {
    id: string;
    scheduled_at: string;
    property?: { title: string; reference: string; address?: string };
    user?: { first_name: string; last_name: string; email: string; phone?: string };
    notes?: string;
  }
): Promise<string | null> {
  const startTime = new Date(visit.scheduled_at);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  const event: CalendarEvent = {
    summary: `Visita — ${visit.property?.reference || 'Imóvel'}`,
    description: [
      visit.property?.title && `Imóvel: ${visit.property.title}`,
      visit.user && `Cliente: ${visit.user.first_name} ${visit.user.last_name}`,
      visit.user?.email && `Email: ${visit.user.email}`,
      visit.user?.phone && `Telefone: ${visit.user.phone}`,
      visit.notes && `\nNotas: ${visit.notes}`,
      `\nVer detalhes: ${process.env.NEXT_PUBLIC_APP_URL}/admin/visitas`,
    ].filter(Boolean).join('\n'),
    location: visit.property?.address,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Europe/Lisbon',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Europe/Lisbon',
    },
  };

  if (visit.user?.email) {
    event.attendees = [{ email: visit.user.email }];
  }

  return createCalendarEvent(consultantId, event);
}
