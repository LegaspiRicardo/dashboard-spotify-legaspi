import React from 'react';
import type { GenreStats } from '../../types/spotify';
import Card from '../ui/Card';

interface GenreOverviewProps {
  stats: GenreStats;
}

const GenreOverview: React.FC<GenreOverviewProps> = ({ stats }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-4">{stats.name}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 text-5xl">Total de Canciones</p>
          <p className="text-2xl font-bold text-white">{stats.trackCount}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Popularidad Promedio</p>
          <p className="text-2xl font-bold text-white">
            {stats.avgPopularity.toFixed(1)}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Artistas Únicos</p>
          <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Top Canciones</h3>
        <div className="space-y-2">
          {stats.topTracks.slice(0, 5).map((track, index) => (
            <div key={track.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 w-6">{index + 1}.</span>
                <img 
                  src={track.album.images[2]?.url} 
                  alt={track.album.name}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <p className="text-white font-medium">{track.name}</p>
                  <p className="text-gray-400 text-sm">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
              </div>
              <span className="text-gray-400">{track.popularity}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default GenreOverview;