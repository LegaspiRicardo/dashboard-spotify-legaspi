import { useState, useEffect } from "react";
import type { Track, GenreStats } from "../types/spotify";
import { spotifyAPI } from "../services/spotifyApi";

export const useSpotifyDataPopular = () => {
  const [technoTracks, setTechnoTracks] = useState<Track[]>([]);
  const [tranceTracks, setTranceTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateGenreStats = (
    tracks: Track[],
    genreName: string
  ): GenreStats => {
    if (tracks.length === 0) {
      return {
        name: genreName,
        trackCount: 0,
        avgPopularity: 0,
        topTracks: [],
        totalArtists: 0,
      };
    }

    const uniqueArtists = new Set(
      tracks.flatMap((track) => track.artists.map((artist) => artist.id))
    );

    const avgPopularity =
      tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;
    const topTracks = [...tracks]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    return {
      name: genreName,
      trackCount: tracks.length,
      avgPopularity: Number(avgPopularity.toFixed(1)),
      topTracks,
      totalArtists: uniqueArtists.size,
    };
  };

  // Función para obtener tracks populares por género
  const getPopularTracksByGenre = async (
    genre: string,
    limit: number = 20
  ): Promise<Track[]> => {
    try {
      // Buscar más tracks para tener de donde filtrar
      const response = await spotifyAPI.searchTracks(`genre:"${genre}"`, 100);

      // Filtrar tracks con alta popularidad y ordenar
      const popularTracks = response.tracks.items
        .filter((track) => track.popularity > 50) // Solo tracks con popularidad > 50
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, limit);

      console.log(`🎯 ${genre} - Found ${popularTracks.length} popular tracks`);

      return popularTracks;
    } catch (error) {
      console.error(`Error fetching popular ${genre} tracks:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🎵 Fetching popular tracks by genre...");

        const [technoData, tranceData] = await Promise.all([
          getPopularTracksByGenre("techno", 25),
          getPopularTracksByGenre("trance", 25),
        ]);

        console.log("✅ Popular genre data received:", {
          techno: technoData.length,
          trance: tranceData.length,
          sampleTechno: technoData
            .slice(0, 3)
            .map((t) => `${t.name} - ${t.artists[0]?.name} (${t.popularity})`),
          sampleTrance: tranceData
            .slice(0, 3)
            .map((t) => `${t.name} - ${t.artists[0]?.name} (${t.popularity})`),
        });

        setTechnoTracks(technoData);
        setTranceTracks(tranceData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch data from Spotify";
        setError(errorMessage);
        console.error("❌ Error in useSpotifyDataPopular:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const technoStats = calculateGenreStats(technoTracks, "TECHNO");
  const tranceStats = calculateGenreStats(tranceTracks, "TRANCE");

  return {
    technoStats,
    tranceStats,
    loading,
    error,
    technoTracks,
    tranceTracks,
  };
};
