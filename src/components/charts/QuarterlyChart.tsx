import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { QuarterlyData } from '../../types/spotify';
import Card from '../ui/Card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface QuarterlyChartProps {
    data: QuarterlyData;
    compact?: boolean;
}

// Función para obtener el rango de meses por trimestre
const getMonthRange = (quarter: number): string => {
    const monthRanges = {
        1: 'Ene - Mar',
        2: 'Abr - Jun', 
        3: 'Jul - Sep',
        4: 'Oct - Dic'
    };
    return monthRanges[quarter as keyof typeof monthRanges] || `Q${quarter}`;
};

const QuarterlyChart: React.FC<QuarterlyChartProps> = ({ data, compact = false }) => {
    // Para vista compacta, mostrar solo 4 puntos por trimestre
    const displayWeeks = compact
        ? data.weeks.filter((_, index) => index % 1 === 0) // Mostrar información semanalmente
        : data.weeks;

    const chartData = {
        labels: displayWeeks.map(week => `S${week.weekNumber}`),
        datasets: [
            {
                label: `Trimestre:`,
                data: displayWeeks.map(week => week.plays),
                backgroundColor: data.color,
                borderColor: data.color,
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: compact ? 1.1 : 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !compact,
                text: `${data.genre} - Q${data.quarter} ${data.year}`,
                color: '#FFFFFF',
                font: {
                    size: 14
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `Reproducciones: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#9CA3AF',
                    maxTicksLimit: compact ? 8 : 8,
                    font: {
                        size: compact ? 8 : 11
                    }
                },
                grid: {
                    color: '#374151',
                    display: !compact
                },
            },
            y: {
                ticks: {
                    color: '#9CA3AF',
                    font: {
                        size: compact ? 0 : 0
                    },
                    callback: function (value: any) {
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    }
                },
                grid: {
                    color: 'transparent',
                },
                beginAtZero: true,
            },
        },
    };

    const totalPlays = data.weeks.reduce((sum, week) => sum + week.plays, 0);
    const avgWeeklyPlays = Math.floor(totalPlays / data.weeks.length);
    const peakPlays = Math.max(...data.weeks.map(week => week.plays));
    const monthRange = getMonthRange(data.quarter);

    return (
        <Card className={`${compact ? 'h-48' : 'h-80'} flex flex-col mb-16`}>
            <div className={` ${compact ? 'flex-1' : 'flex-1 min-h-0'}`}>
                <Bar data={chartData} options={options} />
            </div>

            {!compact ? (
                <div className="p-4 border-t border-gray-700 ">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <p className="text-gray-400">Total Q{data.quarter}</p>
                            <p className="text-white font-bold">{totalPlays.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">Promedio</p>
                            <p className="text-white font-bold">{avgWeeklyPlays.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400">Pico</p>
                            <p className="text-white font-bold">{peakPlays.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            ) : (
                // Para vista compacta, mostrar solo el rango de meses
                <div className="p-2 border-t border-gray-700">
                    <div className="text-center">
                        <p className="text-white font-semibold text-sm">{monthRange}</p>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuarterlyChart;