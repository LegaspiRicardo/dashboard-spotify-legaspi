import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { GenreStats } from '../../types/spotify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GenreStatsChartProps {
  technoStats: GenreStats;
  progressiveStats: GenreStats;
}

const GenreStatsChart: React.FC<GenreStatsChartProps> = ({ 
  technoStats, 
  progressiveStats 
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Comparación de Géneros',
        color: '#f9fafb'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      x: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    },
  };

  const data = {
    labels: ['TECHNO', 'PROGRESSIVE'],
    datasets: [
      {
        label: 'Número de Canciones',
        data: [technoStats.trackCount, progressiveStats.trackCount],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Popularidad Promedio',
        data: [technoStats.avgPopularity, progressiveStats.avgPopularity],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Artistas Únicos',
        data: [technoStats.totalArtists, progressiveStats.totalArtists],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <Bar options={options} data={data} />
    </div>
  );
};

export default GenreStatsChart;