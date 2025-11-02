import './index.css'
import Layout from './components/Layout/Layout';
import GenreOverview from './components/sections/GenreOverview';
//import GenreComparisonChart from './components/charts/GenreComparisonChart';
import { useSpotifyData } from './hooks/useSpotifyData';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useQuarterlyData } from './hooks/useQuarterlyData';
import QuarterlyOverview from './components/charts/QuarterlyOverview';

function App() {
  const { technoStats, tranceStats, loading, error, technoTracks, tranceTracks } = useSpotifyData();
  const quarterlyData = useQuarterlyData(technoTracks, tranceTracks);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-4 text-white">Cargando datos de Spotify...</span>
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
        
        {quarterlyData.length > 0 && (
          <QuarterlyOverview quarterlyData={quarterlyData} />
        )}



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenreOverview stats={technoStats} />
          <GenreOverview stats={tranceStats} />
        </div>
      </div>
    </Layout>
  );
}

export default App;