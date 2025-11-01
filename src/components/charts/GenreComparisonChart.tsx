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

interface GenreComparisonChartProps {
  technoStats: GenreStats;
  tranceStats: GenreStats;  // Cambié el nombre del prop
}

const GenreComparisonChart: React.FC<GenreComparisonChartProps> = ({ 
  technoStats, 
  tranceStats  // Cambié aquí
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f9fafb'
        }
      },
      title: {
        display: true,
        text: 'Comparación de Géneros Musicales',
        color: '#f9fafb',
        font: {
          size: 16
        }
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
    labels: ['TECHNO', 'TRANCE'],  // Cambié aquí
    datasets: [
      {
        label: 'Número de Canciones',
        data: [technoStats.trackCount, tranceStats.trackCount],  // Cambié aquí
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Popularidad Promedio',
        data: [technoStats.avgPopularity, tranceStats.avgPopularity],  // Cambié aquí
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Artistas Únicos',
        data: [technoStats.totalArtists, tranceStats.totalArtists],  // Cambié aquí
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <Bar options={options} data={data} />
    </div>
  );
};

export default GenreComparisonChart;