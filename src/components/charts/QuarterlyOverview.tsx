import React from 'react';
import type { GenreQuarterlyStats } from '../../types/spotify';
import QuarterlyChart from './QuarterlyChart';
import Card from '../ui/Card';

interface QuarterlyOverviewProps {
    quarterlyData: GenreQuarterlyStats[];
}

const QuarterlyOverview: React.FC<QuarterlyOverviewProps> = ({ quarterlyData }) => {
    if (quarterlyData.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Resumen Trimestral 2024</h3>
                <p className="text-gray-400">Cargando datos trimestrales...</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 text-center">Analisis de reproducciones durante el 2024</h3>
                <p className='text-center text-gray-400'>Indicados por trimestres</p>
            </Card>

            {quarterlyData.map(genreData => (
                <div key={genreData.genre} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">{genreData.genre}</h4>
                        <div className="text-sm text-gray-400">
                             <span className="text-white font-bold">{genreData.totalYearPlays.toLocaleString()}</span> Reproducciones
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ">
                        {genreData.quarters.map(quarter => (
                            <QuarterlyChart
                                key={`${genreData.genre}-q${quarter.quarter}`}
                                data={quarter}
                                compact={true}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuarterlyOverview;