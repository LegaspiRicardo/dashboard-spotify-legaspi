import { useState, useEffect, useMemo } from 'react';
import type { GenreQuarterlyStats, Track, QuarterlyData, WeekData } from '../types/spotify';

// Cambia la interfaz para aceptar tracks directamente por género
export const useQuarterlyData = (technoTracks: Track[], tranceTracks: Track[]) => {
    const [quarterlyData, setQuarterlyData] = useState<GenreQuarterlyStats[]>([]);

    const generatedData = useMemo(() => {
        const genreData = {
            'TECHNO': technoTracks,
            'TRANCE': tranceTracks
        };
        return generateQuarterlyData(genreData);
    }, [technoTracks, tranceTracks]);

    useEffect(() => {
        setQuarterlyData(generatedData);
    }, [generatedData]);

    return quarterlyData;
};

// Generar datos trimestrales realistas basados en los tracks
const generateQuarterlyData = (genreData: { [key: string]: Track[] }): GenreQuarterlyStats[] => {
    const currentYear = new Date().getFullYear();

    // Colores para cada trimestre
    const quarterColors = {
        1: '#1DB954', // Spotify green - Q1
        2: '#3B82F6', // Blue - Q2
        3: '#8B5CF6', // Purple - Q3  
        4: '#EF4444'  // Red - Q4
    };

    return Object.entries(genreData).map(([genre, tracks]) => {
        const quarters: QuarterlyData[] = [1, 2, 3, 4].map(quarter => {
            const weeklyData = generateWeeklyData(quarter, tracks, genre, currentYear);
            const totalPlays = weeklyData.reduce((sum, week) => sum + week.plays, 0);

            return {
                quarter,
                year: currentYear,
                weeks: weeklyData,
                totalPlays,
                color: quarterColors[quarter as keyof typeof quarterColors],
                genre
            };
        });

        const totalYearPlays = quarters.reduce((sum, quarter) => sum + quarter.totalPlays, 0);

        return {
            genre,
            quarters,
            totalYearPlays
        };
    });
};

const generateWeeklyData = (quarter: number, tracks: Track[], genre: string, currentYear: number): WeekData[] => {
    const weeks: WeekData[] = [];
    const weeksInQuarter = 13;

    // Calcular base de reproducciones basada en popularidad y cantidad de tracks
    const avgPopularity = tracks.length > 0
        ? tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length
        : 50;

    // Factor de género (Techno suele tener más reproducciones que Trance)
    const genreFactor = genre === 'TECHNO' ? 1.2 : 1.0;

    // Base de reproducciones escalada
    const basePlays = Math.floor((avgPopularity / 100) * 15000 * genreFactor);

    let previousPlays = basePlays;

    for (let week = 1; week <= weeksInQuarter; week++) {
        // Variación semanal más realista (±15-25%)
        const variation = 0.75 + (Math.random() * 0.5);
        let weeklyPlays = Math.floor(basePlays * variation);

        // Tendencia de crecimiento/decaimiento por trimestre
        if (quarter === 1) weeklyPlays = Math.floor(weeklyPlays * 0.9); // Q1 más bajo
        if (quarter === 4) weeklyPlays = Math.floor(weeklyPlays * 1.1); // Q4 más alto

        // Determinar tendencia
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (weeklyPlays > previousPlays * 1.1) trend = 'up';
        else if (weeklyPlays < previousPlays * 0.9) trend = 'down';

        previousPlays = weeklyPlays;

        weeks.push({
            weekNumber: ((quarter - 1) * 13) + week,
            plays: weeklyPlays,
            date: `${currentYear}-Q${quarter}-W${week}`,
            trend
        });
    }

    return weeks;
};