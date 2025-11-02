import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-transparent rounded-xl shadow-lg  p-2 ${className}`}>
      {children}
    </div>
  );
};

export default Card;