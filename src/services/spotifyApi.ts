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

  async searchPlaylists(query: string, limit: number = 20): Promise<any> {
    return this.makeRequest('/search', {
      q: `${query}`,
      type: 'playlist',
      limit: limit.toString(),
      market: 'US'
    });
  }

  async searchTracksByMarket(query: string, market: string = 'US', limit: number = 50): Promise<SpotifySearchResponse> {
    return this.makeRequest<SpotifySearchResponse>('/search', {
      q: query,
      type: 'track',
      limit: limit.toString(),
      market: market
    });
  }

  async searchPlaylistsByMarket(query: string, market: string = 'US', limit: number = 20): Promise<any> {
    return this.makeRequest('/search', {
      q: query,
      type: 'playlist',
      limit: limit.toString(),
      market: market
    });
  }

  async getTracksByGenreAndMarket(genre: string, market: string = 'US', limit: number = 50): Promise<Track[]> {
    try {
      console.log(`🎵 Searching "${genre}" tracks for market ${market}`);
      
      // Usar búsqueda general en lugar de búsqueda exacta por género
      const response = await this.searchTracksByMarket(genre, market, limit);
      
      console.log(`✅ Found ${response.tracks.items.length} ${genre} tracks for ${market}`);
      
      return response.tracks.items;
    } catch (error) {
      console.error(`Error fetching ${genre} tracks for market ${market}:`, error);
      throw error;
    }
  }

  async searchPlaylistsWithFallback(genre: string, limit: number = 20): Promise<any> {
    const searchTerms: Record<string, string[]> = {
      trance: ['trance', 'trance music', 'trance mix', 'uplifting trance', 'vocal trance'],
      techno: ['techno', 'techno music', 'techno mix'],
      house: ['house', 'house music', 'house mix'],
    };

    const terms = searchTerms[genre] || [genre];

    for (const term of terms) {
      try {
        console.log(`🔍 Searching playlists with term: "${term}"`);
        const response = await this.searchPlaylists(term, limit);

        if (response.playlists?.items?.length > 0) {
          console.log(`✅ Found ${response.playlists.items.length} playlists with term: "${term}"`);
          return response;
        }
      } catch (error) {
        console.warn(`⚠️ Search failed for term "${term}":`, error);
        continue;
      }
    }

    throw new Error(`No playlists found for genre "${genre}" after trying terms: ${terms.join(', ')}`);
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