import { useState, useEffect } from 'react';
import type { Track, GenreStats } from '../types/spotify';
import { spotifyAPI } from '../services/spotifyApi';

export const useGenres = (genres: string[]) => {
  const [genreData, setGenreData] = useState<{ [key: string]: Track[] }>({});
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
      name: genreName.toUpperCase(),
      trackCount: tracks.length,
      avgPopularity: Number(avgPopularity.toFixed(1)),
      topTracks,
      totalArtists: uniqueArtists.size,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const genrePromises = genres.map(genre => 
          spotifyAPI.getTracksByGenre(genre, 20)
        );

        const results = await Promise.all(genrePromises);
        
        const newGenreData: { [key: string]: Track[] } = {};
        genres.forEach((genre, index) => {
          newGenreData[genre.toUpperCase()] = results[index];
        });

        setGenreData(newGenreData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data from Spotify';
        setError(errorMessage);
        console.error('❌ Error in useGenres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [genres]);

  const genreStats = Object.entries(genreData).reduce((acc, [genre, tracks]) => {
    acc[genre] = calculateGenreStats(tracks, genre);
    return acc;
  }, {} as { [key: string]: GenreStats });

  return {
    genreStats,
    loading,
    error,
    genreData
  };
};