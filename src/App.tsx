import { useEffect } from 'react';
import './index.css'
import Layout from './components/Layout/Layout';
import GenreOverview from './components/sections/GenreOverview';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useQuarterlyData } from './hooks/useQuarterlyData';
import QuarterlyOverview from './components/charts/QuarterlyOverview';
import CountryFilter from './components/ui/CountryFilter';
import { useSpotifyDataByCountry, COUNTRIES } from './hooks/useSpotifyDataByCountry';
import type { Track, GenreStats } from './types/spotify';

function App() {
  const { 
    technoTracks, 
    tranceTracks, 
    loading, 
    error, 
    selectedCountry, 
    setSelectedCountry 
  } = useSpotifyDataByCountry();

  const quarterlyData = useQuarterlyData(technoTracks, tranceTracks);

  // Debug en tiempo real
  useEffect(() => {
    console.log('📊 APP STATE:', {
      technoTracks: technoTracks.length,
      tranceTracks: tranceTracks.length,
      quarterlyData: quarterlyData.length,
      selectedCountry,
      loading
    });
  }, [technoTracks, tranceTracks, quarterlyData, selectedCountry, loading]);

  // Función para calcular stats
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

  const technoStats = calculateGenreStats(technoTracks, 'TECHNO');
  const tranceStats = calculateGenreStats(tranceTracks, 'TRANCE');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-4 text-white">
          Cargando datos de {COUNTRIES[selectedCountry]?.name}...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl text-center max-w-md">
          <div className="text-2xl mb-4">❌ Error</div>
          <div className="mb-4">{error}</div>
          <div className="text-sm text-gray-400 mb-4">
            Esto puede pasar si:
          </div>
          <ul className="text-sm text-gray-400 text-left list-disc list-inside space-y-1">
            <li>Las credenciales de Spotify son incorrectas</li>
            <li>La app de Spotify no está activa en el dashboard</li>
            <li>Hay problemas de red</li>
            <li>El mercado seleccionado no está disponible</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Spotify Music</h1>
          <p className="text-gray-400">Evolución de reproducciones de los géneros TECHNO vs TRANCE</p>
        </div>

        {/* Filtro de países */}
        <CountryFilter 
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          loading={loading}
        />

        {/* Gráficas trimestrales - Mostrar incluso si hay pocos datos */}
        {quarterlyData.length > 0 ? (
          <QuarterlyOverview quarterlyData={quarterlyData} />
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No hay datos para mostrar</h3>
            <p className="text-gray-400">
              No se encontraron tracks de TECHNO o TRANCE para el mercado seleccionado.
              Intenta con otro país.
            </p>
          </div>
        )}

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Resumen por Género</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-spotify-green">{technoStats.trackCount}</div>
                <div className="text-gray-400 text-sm">Tracks TECHNO</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{tranceStats.trackCount}</div>
                <div className="text-gray-400 text-sm">Tracks TRANCE</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-spotify-green">{technoStats.avgPopularity}</div>
                <div className="text-gray-400 text-sm">Popularidad TECHNO</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{tranceStats.avgPopularity}</div>
                <div className="text-gray-400 text-sm">Popularidad TRANCE</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Información del Mercado</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">País seleccionado:</span>
                <span className="text-white font-semibold text-lg">
                  {COUNTRIES[selectedCountry]?.flag} {COUNTRIES[selectedCountry]?.name}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">Total de tracks:</span>
                <span className="text-white font-semibold">{technoTracks.length + tranceTracks.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">Artistas únicos:</span>
                <span className="text-white font-semibold">{technoStats.totalArtists + tranceStats.totalArtists}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview detallado de géneros - Solo mostrar si hay datos */}
        {(technoStats.trackCount > 0 || tranceStats.trackCount > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {technoStats.trackCount > 0 && <GenreOverview stats={technoStats} />}
            {tranceStats.trackCount > 0 && <GenreOverview stats={tranceStats} />}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;