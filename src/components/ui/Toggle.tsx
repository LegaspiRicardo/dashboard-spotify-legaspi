import React from 'react';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  onLabel?: string;
  offLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({ 
  isOn, 
  onToggle, 
  onLabel = 'ON', 
  offLabel = 'OFF' 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm font-medium ${!isOn ? 'text-white' : 'text-gray-400'}`}>
        {offLabel}
      </span>
      
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isOn ? 'bg-spotify-green' : 'bg-gray-600'
        }`}
        onClick={onToggle}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isOn ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span className={`text-sm font-medium ${isOn ? 'text-white' : 'text-gray-400'}`}>
        {onLabel}
      </span>
    </div>
  );
};

export default Toggle;