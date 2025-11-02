import React from 'react';
import { COUNTRIES, type CountryCode } from '../../hooks/useSpotifyDataByCountry';
import Card from './Card';

interface CountryFilterProps {
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  loading?: boolean;
}

const CountryFilter: React.FC<CountryFilterProps> = ({ 
  selectedCountry, 
  onCountryChange, 
  loading = false 
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-white font-semibold text-lg">Filtrar por País</h4>
          <p className="text-gray-400 text-sm">
            {loading ? 'Cargando datos...' : `Mostrando datos de ${COUNTRIES[selectedCountry].name}`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {(Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][]).map(([code, country]) => (
            <button
              key={code}
              disabled={loading}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all min-w-[100px] border-2 ${
                selectedCountry === code 
                  ? 'bg-spotify-green text-white border-spotify-green shadow-lg transform scale-105' 
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => onCountryChange(code)}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CountryFilter;