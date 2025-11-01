export interface ApiConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface Artist {
  id: string;
  name: string;
  type?: string;
  href?: string;
  uri?: string;
  external_urls?: {
    spotify: string;
  };
}

export interface Album {
  id: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  release_date_precision: string;
  images: Array<{ url: string; height: number; width: number }>;
  artists: Artist[];
  external_urls: {
    spotify: string;
  };
}

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  popularity: number;
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  href: string;
  type: string;
  uri: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  followers: {
    total: number;
  };
  images: Array<{ url: string; height: number; width: number }>;
  owner: {
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

export interface TracksSearchResult {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
  previous: string | null;
  next: string | null;
  href: string;
}

export interface PlaylistsSearchResult {
  items: Playlist[];
  total: number;
  limit: number;
  offset: number;
  previous: string | null;
  next: string | null;
  href: string;
}

export interface SpotifySearchResponse {
  tracks: TracksSearchResult;
  playlists: PlaylistsSearchResult;
}

export interface GenreStats {
  name: string;
  trackCount: number;
  avgPopularity: number;
  topTracks: Track[];
  totalArtists: number;
}