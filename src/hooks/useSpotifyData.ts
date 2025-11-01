import { useState, useEffect } from 'react';
import type{ Track, GenreStats, Playlist } from '../types/spotify';
import { spotifyAPI } from '../services/spotifyApi';

export const useSpotifyData = () => {
  const [technoTracks, setTechnoTracks] = useState<Track[]>([]);
  const [tranceTracks, setTranceTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateGenreStats = (tracks: Track[], genreName: string): GenreStats => {
    if (tracks.length === 0) {
      return {
        name: genreName,
        trackCount: 0,
        avgPopularity: 0,
        topTracks: [],
        totalArtists: 0,
      };
    }

    const uniqueArtists = new Set(tracks.flatMap(track => 
      track.artists.map(artist => artist.id)
    ));

    const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;
    const topTracks = [...tracks].sort((a, b) => b.popularity - a.popularity).slice(0, 10);

    return {
      name: genreName,
      trackCount: tracks.length,
      avgPopularity: Number(avgPopularity.toFixed(1)),
      topTracks,
      totalArtists: uniqueArtists.size,
    };
  };

  // Función para buscar playlists populares por género
  const findPopularPlaylistsByGenre = async (genre: string, limit: number = 5): Promise<Playlist[]> => {
    try {
      console.log(`🔍 Searching popular ${genre} playlists...`);
      
      const response = await spotifyAPI.searchPlaylists(`${genre}`, limit);
      
      const playlists = response.playlists.items
        .filter((playlist: Playlist | null) => playlist !== null)
        .sort((a: Playlist, b: Playlist) => (b.followers?.total || 0) - (a.followers?.total || 0));
      
      console.log(`✅ Found ${playlists.length} ${genre} playlists:`, 
        playlists.map(p => ({ name: p.name, followers: p.followers?.total, id: p.id }))
      );
      
      return playlists;
    } catch (error) {
      console.error(`Error finding ${genre} playlists:`, error);
      return [];
    }
  };

  // Función para obtener tracks de las playlists más populares
  const getTracksFromPopularPlaylists = async (genre: string): Promise<Track[]> => {
    try {
      // Buscar las playlists más populares del género
      const playlists = await findPopularPlaylistsByGenre(genre, 3);
      
      if (playlists.length === 0) {
        throw new Error(`No playlists found for ${genre}`);
      }

      const allTracks: Track[] = [];
      
      // Obtener tracks de cada playlist (máximo 2 playlists para no exceder límites)
      for (const playlist of playlists.slice(0, 2)) {
        try {
          console.log(`📋 Getting tracks from playlist: ${playlist.name}`);
          const tracks = await spotifyAPI.getPlaylistTracks(playlist.id, 15);
          allTracks.push(...tracks);
        } catch (playlistError) {
          console.warn(`⚠️ Could not get tracks from playlist ${playlist.name}:`, playlistError);
        }
      }

      // Eliminar duplicados y ordenar por popularidad
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );

      const popularTracks = uniqueTracks
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 25);

      console.log(`🎵 ${genre} - Final tracks:`, popularTracks.length);
      
      return popularTracks;
    } catch (error) {
      console.error(`Error getting tracks for ${genre}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Starting advanced data fetch...');
        
        const [technoData, tranceData] = await Promise.all([
          getTracksFromPopularPlaylists('techno'),
          getTracksFromPopularPlaylists('trance')
        ]);

        console.log('✅ Final data loaded:', {
          techno: {
            count: technoData.length,
            sample: technoData.slice(0, 3).map(t => `${t.name} - ${t.artists[0]?.name} (${t.popularity})`)
          },
          trance: {
            count: tranceData.length,
            sample: tranceData.slice(0, 3).map(t => `${t.name} - ${t.artists[0]?.name} (${t.popularity})`)
          }
        });

        setTechnoTracks(technoData);
        setTranceTracks(tranceData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data from Spotify';
        setError(errorMessage);
        console.error('❌ Error in useSpotifyData:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const technoStats = calculateGenreStats(technoTracks, 'TECHNO');
  const tranceStats = calculateGenreStats(tranceTracks, 'TRANCE');

  return {
    technoStats,
    tranceStats,
    loading,
    error,
    technoTracks,
    tranceTracks
  };
};