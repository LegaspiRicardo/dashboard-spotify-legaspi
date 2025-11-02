import React, { useState } from 'react';
import type { GenreQuarterlyStats } from '../../types/spotify';
import QuarterlyChart from './QuarterlyChart';
import Card from '../ui/Card';
import Toggle from '../ui/Toggle';

interface QuarterlyOverviewProps {
    quarterlyData: GenreQuarterlyStats[];
}

// Definir tipo para el estado de géneros visibles
type VisibleGenres = {
    1: 'TECHNO' | 'TRANCE';
    2: 'TECHNO' | 'TRANCE';
    3: 'TECHNO' | 'TRANCE';
    4: 'TECHNO' | 'TRANCE';
};

// Función para obtener el rango de meses por trimestre
const getMonthRange = (quarter: number): string => {
    const monthRanges: { [key: number]: string } = {
        1: 'Enero - Marzo',
        2: 'Abril - Junio', 
        3: 'Julio - Septiembre',
        4: 'Octubre - Diciembre'
    };
    return monthRanges[quarter] || `Trimestre ${quarter}`;
};

const QuarterlyOverview: React.FC<QuarterlyOverviewProps> = ({ quarterlyData }) => {
    // Estado para controlar qué género mostrar por trimestre
    const [visibleGenres, setVisibleGenres] = useState<VisibleGenres>({
        1: 'TECHNO', // Q1 muestra Techno por defecto
        2: 'TECHNO', // Q2 muestra Techno por defecto  
        3: 'TECHNO', // Q3 muestra Techno por defecto
        4: 'TECHNO'  // Q4 muestra Techno por defecto
    });

    // Función para alternar entre géneros
    const toggleGenre = (quarter: keyof VisibleGenres) => {
        setVisibleGenres(prev => ({
            ...prev,
            [quarter]: prev[quarter] === 'TECHNO' ? 'TRANCE' : 'TECHNO'
        }));
    };

    if (quarterlyData.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Resumen Trimestral 2024</h3>
                <p className="text-gray-400">Cargando datos trimestrales...</p>
            </Card>
        );
    }

    // Reorganizar los datos por trimestre en lugar de por género
    const quartersData = ([1, 2, 3, 4] as const).map(quarter => {
        const technoQuarter = quarterlyData
            .find(genreData => genreData.genre === 'TECHNO')
            ?.quarters.find(q => q.quarter === quarter);
        
        const tranceQuarter = quarterlyData
            .find(genreData => genreData.genre === 'TRANCE')
            ?.quarters.find(q => q.quarter === quarter);

        return {
            quarter,
            techno: technoQuarter,
            trance: tranceQuarter,
            visibleGenre: visibleGenres[quarter],
            monthRange: getMonthRange(quarter)
        };
    });

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 text-center">Análisis de reproducciones durante el 2024</h3>
                <p className='text-center text-gray-400'>Intercambia entre TECHNO y TRANCE por trimestre</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quartersData.map(({ quarter, techno, trance, visibleGenre, monthRange }) => {
                    const currentData = visibleGenre === 'TECHNO' ? techno : trance;
                    
                    if (!currentData) return null;

                    return (
                        <div key={`quarter-${quarter}`} className="space-y-3">
                            {/* Header del trimestre */}
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">{monthRange}</p>
                            </div>

                            {/* Gráfica */}
                            <QuarterlyChart
                                data={currentData}
                                compact={true}
                            />

                            {/* Toggle para cambiar género */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="flex items-center justify-between w-full max-w-xs">
                                    <span className={`text-sm font-medium ${
                                        visibleGenre === 'TECHNO' ? 'text-spotify-green' : 'text-gray-400'
                                    }`}>
                                        TECHNO
                                    </span>
                                    
                                    <Toggle
                                        isOn={visibleGenre === 'TRANCE'}
                                        onToggle={() => toggleGenre(quarter)}
                                        onLabel=""
                                        offLabel=""
                                    />
                                    
                                    <span className={`text-sm font-medium ${
                                        visibleGenre === 'TRANCE' ? 'text-purple-589+00' : 'text-gray-400'
                                    }`}>
                                        TRANCE
                                    </span>
                                </div>
                                
                                {/* Estadísticas rápidas */}
                                <div className="text-center text-xs text-gray-400">
                                    <p> {currentData.totalPlays.toLocaleString()} reproducciones</p>
                                    <p>Promedio: {Math.floor(currentData.totalPlays / currentData.weeks.length).toLocaleString()}/semana</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resumen anual */}
            <Card className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {quarterlyData.map(genreData => (
                        <div key={genreData.genre} className="text-center">
                            <h4 className="text-lg font-semibold text-white mb-2">{genreData.genre}</h4>
                            <p className="text-2xl font-bold text-spotify-green">
                                {genreData.totalYearPlays.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm">Reproducciones anuales</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default QuarterlyOverview;