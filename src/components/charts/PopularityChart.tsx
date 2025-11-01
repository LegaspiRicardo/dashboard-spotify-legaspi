import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Track } from '../../types/spotify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PopularityChartProps {
  technoTracks: Track[];
  progressiveTracks: Track[];
}

const PopularityChart: React.FC<PopularityChartProps> = ({ 
  technoTracks, 
  progressiveTracks 
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Popularidad',
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

  // Tomar solo los primeros 10 tracks para no saturar el gráfico
  const technoPopularity = technoTracks.slice(0, 10).map(track => track.popularity);
  const progressivePopularity = progressiveTracks.slice(0, 10).map(track => track.popularity);
  const labels = Array.from({ length: 10 }, (_, i) => `Track ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: 'TECHNO',
        data: technoPopularity,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
      {
        label: 'PROGRESSIVE',
        data: progressivePopularity,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <Line options={options} data={data} />
    </div>
  );
};

export default PopularityChart;