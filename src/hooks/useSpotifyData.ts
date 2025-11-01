import { useState, useEffect } from 'react';
import type { Track, GenreStats } from '../types/spotify';
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

  // Función mejorada para buscar playlists con términos alternativos
  const searchPlaylistsWithFallback = async (genre: string, limit: number = 20): Promise<any> => {
    // Términos de búsqueda alternativos para cada género
    const searchTerms: Record<string, string[]> = {
      techno: ['techno', 'techno music', 'techno mix', 'techno 2024'],
      trance: ['trance', 'trance music', 'trance mix', 'uplifting trance', 'vocal trance', 'psytrance'],
      house: ['house', 'house music', 'house mix', 'deep house'],
    };

    const terms = searchTerms[genre] || [genre];
    
    console.log(`🔄 Trying search terms for ${genre}:`, terms);

    for (const term of terms) {
      try {
        console.log(`🔍 Searching playlists with term: "${term}"`);
        const response = await spotifyAPI.searchPlaylists(term, limit);
        
        if (response.playlists?.items?.length > 0) {
          console.log(`✅ Found ${response.playlists.items.length} playlists with term: "${term}"`);
          return response;
        } else {
          console.log(`❌ No playlists found with term: "${term}"`);
        }
      } catch (error) {
        console.warn(`⚠️ Search failed for term "${term}":`, error);
        continue;
      }
    }
    
    // Si llegamos aquí, ningún término funcionó
    throw new Error(`No playlists found for genre "${genre}" after trying terms: ${terms.join(', ')}`);
  };

  // Función para obtener tracks de las playlists más populares - CORREGIDA
  const getTracksFromPopularPlaylists = async (genre: string): Promise<Track[]> => {
    try {
      console.log(`🎯 Starting track search for genre: ${genre}`);
      
      // Usar la función con fallback
      const searchResponse = await searchPlaylistsWithFallback(genre, 15);
      const playlists = searchResponse.playlists?.items || [];
      
      // CORRECCIÓN: Filtrar playlists nulas ANTES del map
      const validPlaylists = playlists
        .filter((playlist: any) => 
          playlist !== null && 
          playlist.id && 
          playlist.name
        );

      console.log(`✅ Found ${validPlaylists.length} valid ${genre} playlists:`, 
        validPlaylists.map((p: any) => ({ name: p.name, id: p.id })));

      if (validPlaylists.length === 0) {
        throw new Error(`No valid playlists found for ${genre}`);
      }

      // Tomar las playlists más populares (máximo 3)
      const topPlaylists = validPlaylists.slice(0, 3);

      console.log(`📋 Using ${topPlaylists.length} playlists for ${genre}:`, 
        topPlaylists.map((p: any) => p.name));

      const allTracks: Track[] = [];
      
      // Obtener tracks de cada playlist
      for (const playlist of topPlaylists) {
        try {
          console.log(`🎵 Getting tracks from playlist: ${playlist.name}`);
          const tracks = await spotifyAPI.getPlaylistTracks(playlist.id, 12);
          
          if (tracks.length > 0) {
            console.log(`📥 Got ${tracks.length} tracks from "${playlist.name}"`);
            allTracks.push(...tracks);
          } else {
            console.warn(`⚠️ No tracks found in playlist "${playlist.name}"`);
          }
        } catch (playlistError) {
          console.warn(`❌ Could not get tracks from playlist ${playlist.name}:`, playlistError);
        }
      }

      if (allTracks.length === 0) {
        throw new Error(`No tracks could be retrieved from any ${genre} playlists`);
      }

      // Eliminar duplicados y ordenar por popularidad
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id) && track !== null
      );

      const popularTracks = uniqueTracks
        .filter(track => track !== null)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 25);

      console.log(`🎯 ${genre} - Final unique tracks: ${popularTracks.length}`);
      
      return popularTracks;
    } catch (error) {
      console.error(`❌ Error getting tracks for ${genre}:`, error);
      throw error;
    }
  };

  // Función mejorada para fetchData con mejor manejo de errores
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Starting advanced data fetch...');

      // Usar Promise.allSettled para manejar errores sin romper todo
      const results = await Promise.allSettled([
        getTracksFromPopularPlaylists('techno'),
        getTracksFromPopularPlaylists('trance')
      ]);

      // Procesar resultados
      const technoResult = results[0];
      const tranceResult = results[1];

      let technoData: Track[] = [];
      let tranceData: Track[] = [];
      const errors: string[] = [];

      if (technoResult.status === 'fulfilled') {
        technoData = technoResult.value;
        console.log(`✅ Techno data loaded: ${technoData.length} tracks`);
      } else {
        const errorMsg = technoResult.reason instanceof Error ? technoResult.reason.message : 'Unknown error';
        errors.push(`Techno: ${errorMsg}`);
        console.error('❌ Failed to load techno data:', technoResult.reason);
      }

      if (tranceResult.status === 'fulfilled') {
        tranceData = tranceResult.value;
        console.log(`✅ Trance data loaded: ${tranceData.length} tracks`);
      } else {
        const errorMsg = tranceResult.reason instanceof Error ? tranceResult.reason.message : 'Unknown error';
        errors.push(`Trance: ${errorMsg}`);
        console.error('❌ Failed to load trance data:', tranceResult.reason);
      }

      // Si ambos fallaron, mostrar error general
      if (technoData.length === 0 && tranceData.length === 0) {
        throw new Error(`All genres failed: ${errors.join('; ')}`);
      }

      // Si al menos uno tiene datos, mostrar advertencia pero continuar
      if (errors.length > 0) {
        console.warn('⚠️ Partial data loaded with errors:', errors);
        setError(`Partial data: ${errors.join('; ')}`);
      }

      console.log('📊 Final data summary:', {
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

  useEffect(() => {
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
    tranceTracks,
    refetch: fetchData
  };
};