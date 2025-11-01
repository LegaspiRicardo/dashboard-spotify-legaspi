import type { ApiConfig, SpotifySearchResponse, Track } from '../types/spotify';

class SpotifyAPI {
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken!;
    }

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Spotify credentials are missing. Please check your .env file');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from Spotify');
      }

      this.accessToken = data.access_token;
      this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 300000;
      
      return this.accessToken!;

    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      this.accessToken = null;
      this.tokenExpiration = null;
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const token = await this.getAccessToken();
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.config.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.accessToken = null;
          this.tokenExpiration = null;
          return this.makeRequest<T>(endpoint, params);
        }
        
        const errorText = await response.text();
        throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 50): Promise<SpotifySearchResponse> {
    return this.makeRequest<SpotifySearchResponse>('/search', {
      q: query,
      type: 'track',
      limit: limit.toString(),
      market: 'US'
    });
  }

  async searchPlaylists(query: string, limit: number = 10): Promise<any> {
    return this.makeRequest('/search', {
      q: query,
      type: 'playlist',
      limit: limit.toString(),
      market: 'US'
    });
  }

  async getTracksByGenre(genre: string, limit: number = 50): Promise<Track[]> {
    try {
      const response = await this.searchTracks(`genre:"${genre}"`, limit);
      return response.tracks.items;
    } catch (error) {
      console.error(`Error fetching ${genre} tracks:`, error);
      throw error;
    }
  }

  async getPlaylistTracks(playlistId: string, limit: number = 20): Promise<Track[]> {
    try {
      const response = await this.makeRequest<any>(`/playlists/${playlistId}/tracks`, {
        limit: limit.toString(),
        fields: 'items(track(id,name,artists,album,popularity,duration_ms,preview_url,external_urls))',
        market: 'US'
      });
      
      const tracks = response.items
        .map((item: any) => item.track)
        .filter((track: any) => track !== null);
      
      return tracks;
    } catch (error) {
      console.error(`Error fetching playlist ${playlistId} tracks:`, error);
      throw error;
    }
  }
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.warn('⚠️ Spotify credentials missing! Please add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file');
}

export const spotifyAPI = new SpotifyAPI({
  clientId: clientId || '',
  clientSecret: clientSecret || '',
  baseUrl: 'https://api.spotify.com/v1',
});