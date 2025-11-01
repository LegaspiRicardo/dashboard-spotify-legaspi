import type { Track } from '../types/spotify';

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getTopArtists = (tracks: Track[], limit: number = 5): string[] => {
  const artistCount: { [key: string]: number } = {};
  
  tracks.forEach(track => {
    track.artists.forEach(artist => {
      artistCount[artist.name] = (artistCount[artist.name] || 0) + 1;
    });
  });

  return Object.entries(artistCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([artist]) => artist);
};

export const calculateAverage = (tracks: Track[], property: keyof Track): number => {
  if (tracks.length === 0) return 0;
  
  const sum = tracks.reduce((total, track) => {
    const value = track[property];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
  
  return sum / tracks.length;
};